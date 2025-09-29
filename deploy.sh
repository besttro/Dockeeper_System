#!/bin/bash

# --- Script Configuration ---
set -e

AWS_REGION="us-west-2"

# --- Step 0: Check for Dependencies ---
echo "🔎 Step 0: Checking for required tools and configurations..."

# [โค้ดเดิมตรวจสอบ dependencies อยู่ที่นี่...]
# (เก็บโค้ดเดิมไว้ทั้งหมด)

echo "✅ All required tools and configurations are in place."

# --- Step 1: Provision Infrastructure with Terraform ---
echo "🚀 Step 1: Applying Terraform configuration..."
cd terraform

echo "   - Initializing Terraform..."
terraform init

echo "   - Validating Terraform configuration..."
terraform validate

terraform apply -auto-approve -var-file="terraform.tfvars"
echo "✅ Terraform apply complete. Fetching outputs..."

# Capture Terraform outputs
ECR_REPO_URL=$(terraform output -raw ecr_repository_url | tr -d '\r')
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name | tr -d '\r')
SERVICE_NAME=$(terraform output -raw ecs_service_name | tr -d '\r')
TASK_DEFINITION_ARN=$(terraform output -raw ecs_task_definition_arn | tr -d '\r')
SUBNET_IDS_STRING=$(terraform output -json public_subnet_ids | jq -r 'join(",")' | tr -d '\r')
SECURITY_GROUP_ID=$(terraform output -raw ecs_tasks_security_group_id | tr -d '\r')
CONTAINER_NAME=$(terraform output -raw ecs_container_name | tr -d '\r')
PROJECT_NAME=$(terraform output -raw project_name | tr -d '\r')

cd ..
echo "   - ECR Repository: $ECR_REPO_URL"
echo "   - Container Name: $CONTAINER_NAME"

# --- Step 2: Build and Push Docker Image ---
echo "🚀 Step 2: Building and pushing Docker image..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL
docker build -t $PROJECT_NAME .
docker tag $PROJECT_NAME:latest $ECR_REPO_URL:latest
docker push $ECR_REPO_URL:latest
echo "✅ Docker image pushed successfully."

# --- Helper Function: Wait for ECS Task to Complete ---
wait_for_task() {
    local TASK_ARN=$1
    local MAX_WAIT=600  # รอสูงสุด 10 นาที
    local WAIT_INTERVAL=15
    local ELAPSED=0
    
    echo "⏳ Waiting for task to complete (ARN: ${TASK_ARN})..."
    
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        TASK_STATUS=$(aws ecs describe-tasks \
            --cluster $CLUSTER_NAME \
            --tasks $TASK_ARN \
            --query 'tasks[0].lastStatus' \
            --output text 2>/dev/null || echo "UNKNOWN")
        
        TASK_STOPPED_REASON=$(aws ecs describe-tasks \
            --cluster $CLUSTER_NAME \
            --tasks $TASK_ARN \
            --query 'tasks[0].stoppedReason' \
            --output text 2>/dev/null || echo "")
        
        echo "   Status: $TASK_STATUS (${ELAPSED}s elapsed)"
        
        if [ "$TASK_STATUS" = "STOPPED" ]; then
            # ตรวจสอบ exit code ของ container
            EXIT_CODE=$(aws ecs describe-tasks \
                --cluster $CLUSTER_NAME \
                --tasks $TASK_ARN \
                --query 'tasks[0].containers[0].exitCode' \
                --output text 2>/dev/null || echo "1")
            
            if [ "$EXIT_CODE" = "0" ]; then
                echo "✅ Task completed successfully!"
                return 0
            else
                echo "❌ Task failed with exit code: $EXIT_CODE"
                echo "   Stopped reason: $TASK_STOPPED_REASON"
                
                # แสดง CloudWatch Logs ถ้ามี
                echo "   Fetching CloudWatch logs..."
                LOG_STREAM=$(aws ecs describe-tasks \
                    --cluster $CLUSTER_NAME \
                    --tasks $TASK_ARN \
                    --query 'tasks[0].containers[0].name' \
                    --output text 2>/dev/null || echo "")
                
                if [ ! -z "$LOG_STREAM" ]; then
                    aws logs tail "/ecs/$PROJECT_NAME" --follow --since 5m 2>/dev/null || echo "   (Could not fetch logs)"
                fi
                
                return 1
            fi
        fi
        
        if [ "$TASK_STATUS" = "UNKNOWN" ]; then
            echo "❌ Could not retrieve task status"
            return 1
        fi
        
        sleep $WAIT_INTERVAL
        ELAPSED=$((ELAPSED + WAIT_INTERVAL))
    done
    
    echo "⏰ Timeout waiting for task to complete"
    return 1
}

# --- Step 3: Run Database Migrations with Prisma ---
echo "🚀 Step 3: Running Prisma database migrations..."

MIGRATION_TASK_ARN=$(aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEFINITION_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_STRING}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
  --overrides '{
      "containerOverrides": [
        {
          "name": "'"$CONTAINER_NAME"'",
          "command": [ "npx", "prisma", "migrate", "deploy" ]
        }
      ]
    }' \
  --query "tasks[0].taskArn" \
  --output text)

if [ -z "$MIGRATION_TASK_ARN" ] || [ "$MIGRATION_TASK_ARN" = "None" ]; then
    echo "❌ Failed to start migration task"
    exit 1
fi

echo "   Migration task started: $MIGRATION_TASK_ARN"

if ! wait_for_task "$MIGRATION_TASK_ARN"; then
    echo "❌ Migration failed. Stopping deployment."
    exit 1
fi

# --- Step 3.5: Seed Database with Admin User ---
echo "🌱 Step 3.5: Seeding database with admin user..."

SEED_TASK_ARN=$(aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEFINITION_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_STRING}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
  --overrides '{
      "containerOverrides": [
        { 
          "name": "'"$CONTAINER_NAME"'", 
          "command": [ "npx", "prisma", "db", "seed" ] 
        }
      ]
    }' \
  --query "tasks[0].taskArn" \
  --output text)

if [ -z "$SEED_TASK_ARN" ] || [ "$SEED_TASK_ARN" = "None" ]; then
    echo "❌ Failed to start seed task"
    exit 1
fi

echo "   Seed task started: $SEED_TASK_ARN"

if ! wait_for_task "$SEED_TASK_ARN"; then
    echo "⚠️  Seeding failed, but continuing deployment..."
fi

# --- Step 4: Deploy New Application Version ---
echo "🚀 Step 4: Forcing new deployment of the application service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --query "service.serviceName"
echo "✅ Deployment successfully triggered."

# --- Final Step: Show Application URL ---
echo "🎉 All steps complete! Your application is being deployed."
cd terraform
APP_URL=$(terraform output -raw load_balancer_dns)
cd ..
echo "🌐 You can access your application shortly at: http://$APP_URL"
echo ""
echo "📋 To check logs, run:"
echo "   aws logs tail /ecs/$PROJECT_NAME --follow --region $AWS_REGION"