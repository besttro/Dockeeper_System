# --- ECR Repository ---
# สร้างที่เก็บ Docker Image ของเรา
resource "aws_ecr_repository" "app" {
  name = "${var.project_name}/app"
}

# --- ECS Cluster ---
# สร้าง Cluster เพื่อจัดกลุ่ม Service ของเรา
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# --- CloudWatch Log Group ---
# สร้างที่เก็บ Log สำหรับแอป
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.project_name}/app"
  retention_in_days = 7 # เก็บ log ไว้ 7 วัน
}

# --- IAM Roles ---
# สร้าง Role ให้ ECS Task เพื่อให้มีสิทธิ์ดึง Image, Secret และเข้าถึง S3
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-exec-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# แนบ Policy พื้นฐานที่จำเป็นสำหรับ ECS
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Policy สำหรับอ่านค่าจาก Secrets Manager
data "aws_iam_policy_document" "ecs_secrets_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.db_credentials.arn]
  }
}

resource "aws_iam_policy" "ecs_secrets_policy" {
  name   = "${var.project_name}-ecs-secrets-policy"
  policy = data.aws_iam_policy_document.ecs_secrets_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ecs_secrets_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_secrets_policy.arn
}

# สร้าง Policy ที่อนุญาตให้แอปเข้าถึง S3 Bucket ได้
data "aws_iam_policy_document" "s3_access_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:DeleteObject"
    ]
    # ระบุ Bucket ที่ต้องการให้เข้าถึง
    resources = ["${aws_s3_bucket.main.arn}/*"] # <-- ใช้ชื่อ Bucket ของคุณ
  }
}

resource "aws_iam_policy" "s3_access_policy" {
  name   = "${var.project_name}-s3-access-policy"
  policy = data.aws_iam_policy_document.s3_access_policy_doc.json
}

# แนบ Policy S3 เข้ากับ Role ของ Task
resource "aws_iam_role_policy_attachment" "s3_access_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.s3_access_policy.arn
}

# --- Application Load Balancer ---
# สร้าง Load Balancer เพื่อรับ traffic จากภายนอก
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = [for subnet in aws_subnet.public : subnet.id]
}

# สร้าง Target Group เพื่อบอกว่า LB จะส่ง traffic ไปที่ไหน
resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check {
    path = "/" # เช็คว่าแอปยังทำงานปกติหรือไม่ที่ path นี้
  }
}

# สร้าง Listener เพื่อดักฟัง traffic ที่ port 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# --- ECS Task Definition ---
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-app"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-container"
      image     = aws_ecr_repository.app.repository_url
      essential = true
      portMappings = [
        { containerPort = var.container_port, hostPort = var.container_port }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      # 1. ดึง Secrets ทั้งหมดมาจาก Secrets Manager
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:DATABASE_URL::" },
        { name = "JWT_SECRET", valueFrom = "${aws_secretsmanager_secret.db_credentials.arn}:JWT_SECRET::" }
      ]
      # 2. เพิ่ม Environment Variables ที่ไม่ลับ
      environment = [
        { name = "S3_BUCKET_NAME", value = aws_s3_bucket.main.id },
        { name = "AWS_REGION", value = var.aws_region }
      ]
    }
  ])
}

# --- ECS Service ---
# สั่งให้ ECS รัน Task ของเราตาม Task Definition ที่สร้างไว้
resource "aws_ecs_service" "main" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1 # สั่งให้รัน 1 container
  launch_type     = "FARGATE"

  # ตั้งค่าเครือข่ายสำหรับ Service
  network_configuration {
    subnets          = [for subnet in aws_subnet.public : subnet.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    # สำคัญมาก: ต้องเปิดเพื่อให้ Fargate Task มี Public IP
    # เพื่อให้มันสามารถดึง Docker image จาก ECR ได้
    assign_public_ip = true
  }

  # เชื่อม Service เข้ากับ Load Balancer
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "${var.project_name}-container"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http]
}
