#!/bin/bash

# --- Script Configuration ---
# Exit script immediately if any command fails
set -e

# AWS Region and Project Name from Terraform variables
# (Ensure these match your .tfvars or variable defaults)
AWS_REGION="us-west-2"
PROJECT_NAME="dockeeper-public"


# --- Step 0: Check for Dependencies (jq) ---
echo "🔎 Step 0: Checking for dependencies..."

if ! command -v jq &> /dev/null
then
    echo "❗️ 'jq' command could not be found. Attempting to install..."
    # Check OS and install jq
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command -v yum &> /dev/null; then
            sudo yum install -y jq
        else
            echo "❌ Could not determine package manager (apt/yum). Please install 'jq' manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac OSX
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew is not installed. Please install 'jq' manually."
            exit 1
        fi
        brew install jq
    else
        echo "❌ Unsupported OS. Please install 'jq' manually."
        exit 1
    fi
    echo "✅ 'jq' has been installed."
else
    echo "✅ 'jq' is already installed."
fi

# --- Step 1: Provision Infrastructure with Terraform ---
echo "🚀 Step 1: Applying Terraform configuration..."

cd terraform

terraform init
terraform validate
terraform apply -auto-approve -var-file="terraform.tfvars"

echo "✅ Terraform apply complete. Fetching outputs..."

# Capture Terraform outputs into variables
ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform output -raw ecs_service_name)
TASK_DEFINITION_ARN=$(terraform output -raw ecs_task_definition_arn)
SUBNET_IDS_STRING=$(terraform output -json public_subnet_ids | jq -r 'join(",")')
SECURITY_GROUP_ID=$(terraform output -raw ecs_tasks_security_group_id)

echo "   - ECR Repository: $ECR_REPO_URL"


# --- Step 2: Build and Push Docker Image ---
echo "🚀 Step 2: Building and pushing Docker image..."

cd ..

# Login to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL

# Build the Docker image
docker build -t $PROJECT_NAME .

# Tag the image for ECR
docker tag $PROJECT_NAME:latest $ECR_REPO_URL:latest

# Push the image to ECR
docker push $ECR_REPO_URL:latest

echo "✅ Docker image pushed successfully."


# --- Step 3: Run Database Migrations with Prisma ---
echo "🚀 Step 3: Running Prisma database migrations..."

# We use 'aws ecs run-task' to execute the migration command in the same
# secure network environment as our application.
aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEFINITION_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_STRING}],securityGroups=[${SECURITY_GROUP_ID}]}" \
  --overrides '{
      "containerOverrides": [
        {
          "name": "'"$PROJECT_NAME-container"'",
          "command": [
            "npx",
            "prisma",
            "migrate",
            "deploy"
          ]
        }
      ]
    }' \
  --query "tasks[0].lastStatus"

echo "⏳ Waiting for migration task to complete... (this may take a minute)"
# A robust script would poll the task status, but for simplicity we'll just wait
sleep 60 

echo "✅ Prisma migration task initiated."


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

# #### **ขั้นตอนที่ 4: วิธีใช้งาน**

# 1.  **ตรวจสอบว่ามี Tools ครบ:**
#     * Terraform
#     * AWS CLI (ต้อง `aws configure` เรียบร้อยแล้ว)
#     * Docker
#     * `jq` (เครื่องมือจัดการ JSON บน command line, ติดตั้งง่าย: `sudo apt-get install jq` หรือ `brew install jq`)

# 2.  **ทำให้ Script Executable:**
#     เปิด Terminal แล้วรันคำสั่งนี้เพียงครั้งเดียว:
#     ```bash
#     chmod +x deploy.sh
#     ```

# 3.  **รันคำสั่งเดียวจบ!**
#     เมื่อไหร่ก็ตามที่คุณต้องการ Deploy โปรเจกต์ทั้งหมด ก็แค่รันคำสั่งนี้:
#     ```bash
#     ./deploy.sh
