resource "aws_security_group" "conversation_evaluations_rds_sg" {
  name        = "conversation-evaluations-rds-sg"
  description = "Security group for Conversation Evaluations PostgreSQL database (private VPC access)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL access from private subnets"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [
      aws_subnet.private_primary.cidr_block,
      aws_subnet.private_secondary.cidr_block
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "grounded-conversation-evaluations-rds-sg"
    Environment = var.environment
  }
}

# DB Subnet Group for Conversation Evaluations
resource "aws_db_subnet_group" "conversation_evaluations" {
  name       = "grounded-conversation-evaluations-subnet-group"
  subnet_ids = [aws_subnet.private_primary.id, aws_subnet.private_secondary.id]

  tags = {
    Name        = "grounded-conversation-evaluations-subnet-group"
    Environment = var.environment
  }
}

# PostgreSQL Database for Conversation Evaluations
resource "aws_db_instance" "conversation_evaluations" {
  identifier              = "grounded-conversation-evaluations-db"
  allocated_storage       = 20
  instance_class          = "db.t3.micro"
  engine                  = "postgres"
  engine_version          = "14.7"
  username                = "admin"
  password                = data.aws_secretsmanager_secret_version.conversation_evaluation_db_password_version.secret_string
  parameter_group_name    = "default.postgres14"
  skip_final_snapshot     = true
  publicly_accessible     = false  # Private - accessible via VPC only
  vpc_security_group_ids  = [aws_security_group.conversation_evaluations_rds_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.conversation_evaluations.name

  tags = {
    Name        = "conversation-evaluations-postgres"
    Environment = var.environment
  }
}