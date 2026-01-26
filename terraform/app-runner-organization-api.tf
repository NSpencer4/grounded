# ============================================================================
# Organization API - App Runner Service
# ============================================================================

# IAM Role for App Runner to access ECR and Secrets Manager
resource "aws_iam_role" "organization_api_access_role" {
  name = "grounded-organization-api-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "grounded-organization-api-access-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "organization_api_ecr_access" {
  role       = aws_iam_role.organization_api_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# IAM Role for App Runner instance (runtime permissions)
resource "aws_iam_role" "organization_api_instance_role" {
  name = "grounded-organization-api-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "grounded-organization-api-instance-role"
    Environment = var.environment
  }
}

# Policy to allow reading secrets
resource "aws_iam_role_policy" "organization_api_secrets_policy" {
  name = "grounded-organization-api-secrets-policy"
  role = aws_iam_role.organization_api_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          data.aws_secretsmanager_secret.organization_api_db.arn,
          data.aws_secretsmanager_secret.jwt_secret.arn
        ]
      }
    ]
  })
}

# Security Group for Organization API
resource "aws_security_group" "organization_api_sg" {
  name        = "organization-api-sg"
  description = "Organization API Security Group - Allow outbound to RDS"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "grounded-organization-api-security-group"
    Environment = var.environment
  }
}

# Update RDS security group to allow Organization API access
resource "aws_security_group_rule" "organization_api_to_rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.organization_api_sg.id
  security_group_id        = aws_security_group.organization_api_rds_sg.id
  description              = "Allow Organization API to access RDS"
}

# RDS Security Group - Private access within VPC
resource "aws_security_group" "organization_api_rds_sg" {
  name        = "organization-api-rds-sg"
  description = "Security group for Organization API PostgreSQL database (private VPC access)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL access from App Runner via VPC connector"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.organization_api_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "grounded-organization-api-rds-sg"
    Environment = var.environment
  }
}

# PostgreSQL Database for Organization API
resource "aws_db_instance" "organization_api_postgres" {
  identifier              = "grounded-organization-api-db"
  allocated_storage       = 20
  # max_allocated_storage   = 100  # POC: Disabled auto-scaling storage to save costs
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = "15.5"
  instance_class          = "db.t3.micro"
  db_name                 = "grounded"
  username                = "postgres"
  password                = data.aws_secretsmanager_secret_version.organization_api_db.secret_string
  parameter_group_name    = "default.postgres15"
  skip_final_snapshot     = true
  publicly_accessible     = false  # Private - accessible via VPC only
  vpc_security_group_ids  = [aws_security_group.organization_api_rds_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.organization_api.name
  # POC: Backups disabled to reduce costs (~$0.095/GB-month for backup storage)
  # backup_retention_period = 7
  # backup_window           = "03:00-04:00"
  # maintenance_window      = "mon:04:00-mon:05:00"

  tags = {
    Name        = "grounded-organization-api-postgres"
    Environment = var.environment
  }
}

# DB Subnet Group (required for VPC-based RDS)
resource "aws_db_subnet_group" "organization_api" {
  name       = "grounded-organization-api-subnet-group"
  subnet_ids = [aws_subnet.private_primary.id, aws_subnet.private_secondary.id]

  tags = {
    Name        = "grounded-organization-api-subnet-group"
    Environment = var.environment
  }
}

# VPC Connector for App Runner to access private RDS
resource "aws_apprunner_vpc_connector" "organization_api_vpc" {
  vpc_connector_name = "organization-api-connector"
  subnets            = [aws_subnet.private_primary.id, aws_subnet.private_secondary.id]
  security_groups    = [aws_security_group.organization_api_sg.id]

  tags = {
    Name        = "organization-api-vpc-connector"
    Environment = var.environment
  }
}

# App Runner Service
resource "aws_apprunner_service" "organization_api" {
  service_name = "grounded-organization-api"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.organization_api_access_role.arn
    }

    image_repository {
      image_identifier      = "${var.organization_api_ecr_repository_url}:latest"
      image_repository_type = "ECR"
      
      image_configuration {
        port = "3000"
        
        runtime_environment_variables = {
          NODE_ENV    = "production"
          PORT        = "3000"
          DB_HOST     = aws_db_instance.organization_api_postgres.address
          DB_PORT     = tostring(aws_db_instance.organization_api_postgres.port)
          DB_NAME     = "grounded"
          DB_USER     = "postgres"
          DB_SSL      = "true"
          CORS_ORIGIN = var.organization_api_cors_origin
        }
        
        runtime_environment_secrets = {
          DB_PASSWORD = data.aws_secretsmanager_secret.organization_api_db.arn
          JWT_SECRET  = data.aws_secretsmanager_secret.jwt_secret.arn
        }
      }
    }

    auto_deployments_enabled = false
  }

  instance_configuration {
    cpu               = "0.5 vCPU"
    memory            = "1 GB"
    instance_role_arn = aws_iam_role.organization_api_instance_role.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"  # Use VPC for private RDS access
      vpc_connector_arn = aws_apprunner_vpc_connector.organization_api_vpc.arn
    }
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.organization_api.arn

  tags = {
    Name        = "grounded-organization-api"
    Environment = var.environment
  }
}

# Auto Scaling Configuration
resource "aws_apprunner_auto_scaling_configuration_version" "organization_api" {
  auto_scaling_configuration_name = "grounded-organization-api-autoscaling"
  max_concurrency                 = 100
  max_size                        = 4
  min_size                        = 1

  tags = {
    Name        = "grounded-organization-api-autoscaling"
    Environment = var.environment
  }
}

# Secrets Manager Data Sources
data "aws_secretsmanager_secret" "organization_api_db" {
  name = "grounded/organization-api-db-password"
}

data "aws_secretsmanager_secret_version" "organization_api_db" {
  secret_id = data.aws_secretsmanager_secret.organization_api_db.id
}

# ============================================================================
# Outputs
# ============================================================================

output "organization_api_url" {
  description = "Organization API App Runner service URL"
  value       = "https://${aws_apprunner_service.organization_api.service_url}"
}

output "organization_api_service_arn" {
  description = "Organization API App Runner service ARN"
  value       = aws_apprunner_service.organization_api.service_arn
}

output "organization_api_service_id" {
  description = "Organization API App Runner service ID"
  value       = aws_apprunner_service.organization_api.service_id
}

output "organization_api_db_endpoint" {
  description = "Organization API PostgreSQL endpoint"
  value       = aws_db_instance.organization_api_postgres.endpoint
}
