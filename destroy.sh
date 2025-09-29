#!/bin/bash

# --- DANGER ZONE ---
# This script will completely destroy all infrastructure managed by Terraform.

set -e

echo "🔥🔥🔥 WARNING: This will destroy ALL resources managed by Terraform."
echo "This includes the RDS database, ECS cluster, Load Balancer, and VPC."
read -p "Are you absolutely sure you want to continue? (type 'yes' to proceed): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    echo "Aborted. No changes were made."
    exit 0
fi

echo "🚀 Proceeding with destruction..."

# Change to the terraform directory
cd terraform

# Run terraform destroy
# It will ask for confirmation again as a final safety measure.
terraform destroy -var-file="terraform.tfvars"

echo "✅ Destruction complete."

cd ..

# **วิธีใช้ `destroy.sh`:**
# 1.  ทำให้มัน Executable: `chmod +x destroy.sh`
# 2.  รันเมื่อต้องการล้างระบบ: `./destroy.sh`

# ---

# ### **สรุป Workflow ของคุณ**

# * **เมื่อต้องการ Deploy โค้ดใหม่:**
#     ```bash
#     ./deploy.sh
#     ```
# * **เมื่อต้องการล้างระบบทั้งหมด (เช่น หลังเลิกใช้งาน):**
#     ```bash
#     ./destroy.sh
    
