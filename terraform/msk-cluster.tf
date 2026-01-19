resource "aws_msk_cluster" "grounded" {
  cluster_name           = "grounded-cluster"
  kafka_version          = "3.4.0" # Specify the Kafka version
  number_of_broker_nodes = 1       # Number of brokers in the cluster

  broker_node_group_info {
    instance_type   = "kafka.t3.small"
    ebs_volume_size = 50
    client_subnets  = var.subnet_ids
    security_groups = [aws_security_group.grounded_msk_sg.id]
  }

  encryption_info {
    encryption_at_rest_kms_key_arn = data.aws_kms_key.msk_key.arn
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled         = false
#         log_group       = aws_cloudwatch_log_group.msk_log_group.name
      }
    }
  }

  tags = {
    Environment = var.environment
    Name        = "grounded-cluster"
  }
}

data "aws_kms_key" "msk_key" {
  key_id = "alias/aws/kms"
}

resource "aws_cloudwatch_log_group" "msk_log_group" {
  name              = "/aws/msk/my-msk-cluster"
  retention_in_days = 1
  tags = {
    Environment = var.environment
    Name        = "grounded-msk-logs"
  }
}

output "msk_cluster_arn" {
  value = aws_msk_cluster.grounded.arn
}

output "msk_bootstrap_brokers" {
  value = aws_msk_cluster.grounded.bootstrap_brokers
}

output "msk_zookeeper_connect_string" {
  value = aws_msk_cluster.grounded.zookeeper_connect_string
}