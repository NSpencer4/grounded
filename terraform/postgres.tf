resource "aws_security_group" "rds_security_group" {
  name        = "rds-security-group"
  description = "Allow database access"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create an RDS Instance for PostgreSQL
resource "aws_db_instance" "conversation_evaluations" {
  allocated_storage       = 20
  instance_class          = "db.t3.micro"
  engine                  = "postgres"
  engine_version          = "14.7"
  username                = "admin"
  password                = data.aws_secretsmanager_secret_version.conversation_evaluation_db_password_version.secret_string
  parameter_group_name    = "default.postgres14"
  skip_final_snapshot     = true                # Do not create backup snapshot on deletion
  publicly_accessible     = true                # Public access, be cautious while enabling!
  vpc_security_group_ids  = [aws_security_group.rds_security_group.id]

  tags = {
    Environment = var.environment
    Name        = "conversation-evaluations-postgres"
  }
}