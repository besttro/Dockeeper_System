// terraform/network.tf

# --- VPC ---
# สร้างเครือข่ายเสมือนส่วนตัวของเรา
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# ดึงรายชื่อ Availability Zones ที่มีใน Region ปัจจุบัน
data "aws_availability_zones" "available" {}

# --- Public Subnets ---
# สร้าง Subnet แบบ Public สำหรับวางทรัพยากรทั้งหมด
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = tolist(data.aws_availability_zones.available.names)[count.index]
  map_public_ip_on_launch = true # สำคัญ: ทำให้ทรัพยากรในนี้มี Public IP ได้
  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

# --- Internet Gateway & Routing ---
# สร้างประตูทางออกสู่อินเทอร์เน็ต
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.project_name}-igw"
  }
}

# สร้างตารางเส้นทางสำหรับ Public Subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  # กำหนดให้ traffic ทั้งหมด (0.0.0.0/0) วิ่งไปที่ Internet Gateway
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# ผูกตารางเส้นทางเข้ากับ Public Subnet ของเรา
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# --- Security Groups (หัวใจของความปลอดภัย) ---

# Security Group สำหรับ Application Load Balancer (ALB)
resource "aws_security_group" "lb" {
  name        = "${var.project_name}-lb-sg"
  description = "Allow HTTP inbound traffic for Load Balancer"
  vpc_id      = aws_vpc.main.id

  # อนุญาตให้ traffic จากอินเทอร์เน็ตเข้ามาที่ port 80 (HTTP)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # อนุญาตให้ traffic ออกไปได้ทุกที่
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group สำหรับ ECS Fargate Tasks (แอปของเรา)
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.project_name}-ecs-tasks-sg"
  description = "Allow inbound traffic from the LB to ECS tasks"
  vpc_id      = aws_vpc.main.id

  # อนุญาตให้ traffic เข้ามาจาก ALB เท่านั้น
  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.lb.id]
  }

  # อนุญาตให้ traffic ออกไปได้ทุกที่ (เพื่อคุยกับ RDS และ ECR)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group สำหรับ RDS Database
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Allow inbound traffic from ECS tasks to RDS"
  vpc_id      = aws_vpc.main.id

  # สำคัญมาก: อนุญาตให้ traffic เข้ามาจาก ECS tasks ของเราเท่านั้น
  # นี่คือสิ่งที่ช่วยป้องกันฐานข้อมูลของคุณจากอินเทอร์เน็ต
  ingress {
    from_port       = 5432 # PostgreSQL port
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}