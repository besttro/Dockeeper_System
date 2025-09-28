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