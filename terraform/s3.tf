# ใช้ random_id เพื่อสร้างชื่อ Bucket ที่ไม่ซ้ำกันทั่วโลก
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# สร้าง S3 Bucket
resource "aws_s3_bucket" "main" {
  # ชื่อ Bucket จะเป็น "dockeeper-uploads-xxxxxxxx"
  # สามารถใช้แบบนี้เพื่อกันชื่อซ้ำ  "${var.project_name}-bucket-${random_id.bucket_suffix.hex}"
  bucket = "${var.project_name}-bucket"

  tags = {
    Name        = "${var.project_name}-bucket"
    Project     = var.project_name
  }
}

# ตั้งค่าการเข้ารหัสข้อมูลฝั่ง Server (Server-Side Encryption)
resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
  }
}

# เปิดใช้งานการเก็บเวอร์ชันของไฟล์ (Versioning)
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ตั้งค่าการบล็อกการเข้าถึงแบบสาธารณะ (Block Public Access)
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# เพิ่ม Policy เพื่ออนุญาตให้ใครก็ได้สามารถอ่านไฟล์ได้ (GetObject)
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.main.id

  # policy คือโค้ด JSON ที่เราใช้กำหนดสิทธิ์
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.main.arn}/*" # อนุญาตทุกไฟล์ใน Bucket นี้
      }
    ]
  })
}