// terraform/variables.tf

variable "aws_region" {
  description = "AWS region ที่จะ deploy"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "ชื่อโปรเจกต์ (สำหรับตั้งชื่อ resource ต่างๆ)"
  type        = string
  default     = "dockeeper"
}

variable "vpc_cidr" {
  description = "CIDR block สำหรับ VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "CIDR blocks สำหรับ Public Subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "db_username" {
  description = "Username สำหรับฐานข้อมูล RDS"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password สำหรับฐานข้อมูล RDS"
  type        = string
  sensitive   = true
}

variable "container_port" {
  description = "Port ที่เปิดใน Docker container"
  type        = number
  default     = 3000
}