
# Security Group for MSK Cluster
resource "aws_security_group" "msk_sg" {
  name        = "msk-security-group"
  description = "Security group for MSK cluster"

  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Replace with your trusted IPs for production
  }

  # Optional: Add ingress/egress for Zookeeper if needed
  ingress {
    from_port   = 2181
    to_port     = 2181
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

# IAM Role for MSK Cluster
resource "aws_iam_role" "msk_iam" {
  name = "msk-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = {
          Service = "kafka.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for MSK Cluster
resource "aws_iam_policy" "msk_iam_policy" {
  name = "msk-cluster-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "ec2:DescribeVpcEndpoints",
          "ec2:ModifyVpcEndpointConnectionNotification",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeVpcAttribute",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeRouteTables"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "msk_role_policy_attach" {
  role       = aws_iam_role.msk_iam.name
  policy_arn = aws_iam_policy.msk_iam_policy.arn
}

# VPC Subnets (You can create or use existing subnets)
data "aws_subnet_ids" "default" {
  vpc_id = "vpc-xxxxxxxxxxxx" # Replace with your VPC ID
}

# MSK Cluster
resource "aws_msk_cluster" "msk_cluster" {
  cluster_name           = "example-msk-cluster"
  kafka_version          = "3.3.1" # Specify the desired Kafka version
  number_of_broker_nodes = 3       # Number of broker nodes

  broker_node_group_info {
    instance_type   = "kafka.m5.large" # Specify broker instance type
    ebs_volume_size = 100             # Storage per broker in GiB
    client_subnets  = data.aws_subnet_ids.default.ids
    security_groups = [aws_security_group.msk_sg.id]
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"           # Encryption for client communications
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.msk_configuration.arn
    revision = aws_msk_configuration.msk_configuration.latest_revision
  }

  tags = {
    Environment = "development"
    Project     = "example-msk"
  }
}

# MSK Configuration (optional, for custom configurations)
resource "aws_msk_configuration" "msk_configuration" {
  name      = "example-msk-configuration"
  kafka_versions = ["3.3.1"]

  server_properties = <<EOT
log.retention.hours=72
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
EOT
}

# Output the MSK Cluster Endpoints
output "bootstrap_brokers_tls" {
  value = aws_msk_cluster.msk_cluster.bootstrap_brokers_tls
}

output "msk_cluster_arn" {
  value = aws_msk_cluster.msk_cluster.arn
}