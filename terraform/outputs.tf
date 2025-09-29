output "load_balancer_dns" {
  description = "DNS name (URL) ของ Application Load Balancer สำหรับเข้าถึงเว็บ"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "URL ของ ECR repository สำหรับ push Docker image"
  value       = aws_ecr_repository.app.repository_url
}


output "ecs_cluster_name" {
  description = "ชื่อของ ECS Cluster ที่ต้องใช้ในคำสั่ง AWS CLI"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ชื่อของ ECS Service ที่ต้องใช้ในคำสั่ง AWS CLI"
  value       = aws_ecs_service.main.name
}

output "ecs_task_definition_arn" {
  description = "ARN ของ ECS Task Definition ที่ต้องใช้ในคำสั่ง AWS CLI"
  value       = aws_ecs_task_definition.app.arn
}

output "public_subnet_ids" {
  description = "IDs ของ Public Subnets สำหรับ Fargate Task"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "ecs_tasks_security_group_id" {
  description = "ID ของ Security Group สำหรับ ECS Tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "ecs_container_name" {
  description = "ชื่อของ Container หลักที่อยู่ใน Task Definition"
  value       = "${var.project_name}-container"
}

output "project_name" {
  description = "ชื่อโปรเจกต์ที่ใช้ในการสร้างทรัพยากรต่างๆ"
  value       = var.project_name
}

output "s3_bucket_name" {
  description = "ชื่อของ S3 Bucket ที่สร้างขึ้นสำหรับเก็บไฟล์"
  value       = aws_s3_bucket.main.id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = local.sanitized_db_name
}