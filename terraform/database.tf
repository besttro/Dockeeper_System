# สร้างตัวแปรท้องถิ่นสำหรับเก็บชื่อฐานข้อมูลที่ถูกต้อง (ไม่มีขีด)
locals {
  # สร้างชื่อฐานข้อมูลที่ถูกต้องโดยการลบเครื่องหมาย "-" ออก
  # ผลลัพธ์ที่ได้จะเป็น "dockeeperpublicdb"
  sanitized_db_name = replace("${var.project_name}db", "-", "")
}

# --- RDS Subnet Group (ใช้ Public Subnets) ---
# บอก RDS ว่าจะสร้างฐานข้อมูลไว้ใน Subnet ชุดไหน
resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.public : subnet.id]
  
  tags = {
    Name = "${var.project_name} DB Subnet Group"
  }
}

# --- RDS Instance ---
# สร้าง Instance ของฐานข้อมูล
resource "aws_db_instance" "main" {
  identifier           = "${var.project_name}-db"
  allocated_storage    = 20 # ขนาดพื้นที่ 20GB (อยู่ใน Free tier)
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "16.3" # กรุณาตรวจสอบเวอร์ชันล่าสุดที่มีให้บริการใน Region ของคุณอีกครั้ง
  instance_class       = "db.t3.micro" # ขนาด Instance (อยู่ใน Free tier)
 
  # ใช้ชื่อ DB ที่ถูกต้องจาก local variable
  db_name              = local.sanitized_db_name
 
  username             = var.db_username
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = true
  publicly_accessible  = true # สำคัญ: ต้องเป็น true เพราะอยู่ใน Public Subnet
  
  # รอให้ security group และ subnet group พร้อมก่อน
  depends_on = [
    aws_db_subnet_group.default,
    aws_security_group.rds
  ]
  
  tags = {
    Name = "${var.project_name} RDS Instance"
  }
}

# --- Secret for DB Credentials ---
# สร้างที่เก็บความลับสำหรับเก็บ DATABASE_URL และ JWT_SECRET
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/rds/credentials"
  recovery_window_in_days = 0 # ลบทันทีเมื่อ destroy (สำหรับ dev/test)
  
  tags = {
    Name = "${var.project_name} DB Credentials"
  }
}

# นำข้อมูลต่างๆ มาประกอบกันเป็น JSON object แล้วเก็บลงใน Secret
resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  
  secret_string = jsonencode({
    # สร้าง DATABASE_URL จาก template
    DATABASE_URL = templatefile("${path.module}/db_secret_template.txt", {
      username = var.db_username,
      password = var.db_password,
      host     = aws_db_instance.main.address,
      port     = aws_db_instance.main.port,
      dbname   = local.sanitized_db_name
    }),
    # ใช้ JWT_SECRET ที่สร้างแบบสุ่ม
    JWT_SECRET = "dockeeper_secret_key"
  })
  depends_on = [
    aws_db_instance.main
  ]
}