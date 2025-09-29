#!/bin/bash

# --- Script Configuration ---
# Exit script immediately if any command fails
set -e

# กำหนด Region ที่จะใช้งาน
AWS_REGION="us-west-2"

# --- Step 0: Check for Dependencies (jq, aws configure, docker) ---
echo "🔎 Step 0: Checking for required tools and configurations..."

# 1. Check for jq
if ! command -v jq &> /dev/null; then
    echo "❗️ 'jq' command could not be found. Attempting to install..."
    # ... (โค้ดติดตั้ง jq เหมือนเดิม)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then sudo apt-get update && sudo apt-get install -y jq; elif command -v yum &> /dev/null; then sudo yum install -y jq; else echo "❌ Could not determine package manager. Please install 'jq' manually."; exit 1; fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then echo "❌ Homebrew not installed. Please install 'jq' manually."; exit 1; fi; brew install jq
    else echo "❌ Unsupported OS. Please install 'jq' manually."; exit 1
    fi
    echo "✅ 'jq' has been installed."
else
    echo "✅ 'jq' is already installed."
fi

# 2. Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo
    echo "❌ AWS CLI is not configured correctly."
    echo "   Please run 'aws configure' and enter your Access Key ID and Secret Access Key."
    exit 1
else
    echo "✅ AWS CLI is configured."
fi

# 3. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❗️ Docker command could not be found. Attempting to install..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # For Debian/Ubuntu
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        # For CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        else
            echo "❌ Could not determine package manager. Please install 'Docker' manually."; exit 1;
        fi
        echo "✅ Docker has been installed. You may need to add your user to the 'docker' group: sudo usermod -aG docker \$USER"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then echo "❌ Homebrew not installed. Cannot install Docker. Please install Docker Desktop manually."; exit 1; fi
        echo "   On macOS, Docker Desktop is required. Installing via Homebrew..."
        brew install --cask docker
        echo "✅ Docker cask installed. Please LAUNCH Docker Desktop manually and run this script again."
        exit 1
    else
        echo "❌ Unsupported OS. Please install 'Docker' manually."; exit 1
    fi
else
    echo "✅ Docker command is available."
fi

# 3.5 Check if Docker Daemon is running
if ! docker info > /dev/null 2>&1; then
    echo
    echo "❌ Docker is not running."
    echo "   Please start Docker Desktop (or the Docker daemon) and run this script again."
    exit 1
else
    echo "✅ Docker is running."
fi

# 4. Check for Terraform
if ! command -v terraform &> /dev/null; then
    echo "❗️ Terraform command could not be found. Attempting to install..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # For Debian/Ubuntu
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
            wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
            echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
            sudo apt-get update && sudo apt-get install -y terraform
        # For CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
            sudo yum -y install terraform
        else
             echo "❌ Could not determine package manager. Please install 'Terraform' manually."; exit 1;
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v brew &> /dev/null; then echo "❌ Homebrew not installed. Cannot install Terraform. Please install it manually."; exit 1; fi
        brew tap hashicorp/tap
        brew install hashicorp/tap/terraform
    else
        echo "❌ Unsupported OS. Please install 'Terraform' manually."; exit 1
    fi
     echo "✅ Terraform has been installed."
else
    echo "✅ Terraform is installed."
fi

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

# Capture Terraform outputs into variables
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
docker push $PROJECT_NAME:latest
echo "✅ Docker image pushed successfully."

# --- Step 3: Run Database Migrations with Prisma ---
echo "🚀 Step 3: Running Prisma database migrations..."
aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEFINITION_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_STRING}],securityGroups=[${SECURITY_GROUP_ID}]}" \
  --overrides '{
      "containerOverrides": [
        {
          "name": "'"$CONTAINER_NAME"'",
          "command": [ "npx", "prisma", "migrate", "deploy" ]
        }
      ]
    }' \
  --query "tasks[0].lastStatus"
echo "⏳ Waiting for migration task to complete... (this may take a minute)"
sleep 60
echo "✅ Prisma migration task initiated."

# --- Step 3.5: Seed Database with Admin User ---
echo "🌱 Step 3.5: Seeding database with admin user..."
aws ecs run-task \
  --cluster $CLUSTER_NAME \
  --task-definition $TASK_DEFINITION_ARN \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS_STRING}],securityGroups=[${SECURITY_GROUP_ID}]}" \
  --overrides '{
      "containerOverrides": [
        { "name": "'"$CONTAINER_NAME"'", "command": [ "npx", "prisma", "db", "seed" ] }
      ]
    }' \
  --query "tasks[0].lastStatus"
echo "⏳ Waiting for seed task to complete..."
sleep 30
echo "✅ Database seeding task initiated."

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