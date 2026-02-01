# Data source to get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "kafka_cluster" {
  ami           = data.aws_ami.amazon_linux_2.id
  # instance_type = "t3.small" # 2GB RAM - minimum recommended for Kafka/Zookeeper
  instance_type = "t3.micro" # 2GB RAM - minimum recommended for Kafka/Zookeeper micro could be unstable

  subnet_id                   = aws_subnet.private_primary.id
  vpc_security_group_ids      = [aws_security_group.grounded_kafka_cluster_sg.id]
  associate_public_ip_address = false # Only available in vpc

  # This script installs Docker and starts Kafka via Docker Compose
  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user

              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # Create Kafka setup
              mkdir -p /home/ec2-user/kafka
              cat <<EOT > /home/ec2-user/kafka/docker-compose.yml
              version: '3'
              services:
                zookeeper:
                  image: confluentinc/cp-zookeeper:7.5.0
                  environment:
                    ZOOKEEPER_CLIENT_PORT: 2181
                kafka:
                  image: confluentinc/cp-kafka:7.5.0
                  depends_on:
                    - zookeeper
                  environment:
                    KAFKA_BROKER_ID: 1
                    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
                    # AWS's metadata ip address to get the private ip and inject it into this config
                    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4):9092
                    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
                    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
                    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
                  ports:
                    - "9092:9092"
                schema-registry:
                  image: confluentinc/cp-schema-registry:7.5.0
                  depends_on:
                    - kafka
                  environment:
                    SCHEMA_REGISTRY_HOST_NAME: schema-registry
                    SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka:9092
                    SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
                  ports:
                    - "8081:8081"
              EOT

              cd /home/ec2-user/kafka
              /usr/local/bin/docker-compose up -d
              EOF

  tags = {
    Name        = "grounded-kafka-cluster"
    Environment = var.environment
  }
}

# Output the internal IP so your Lambda/APIs can find it
output "kafka_broker_address" {
  value = "${aws_instance.kafka_cluster.private_ip}:9092"
}

output "schema_registry_url" {
  value = "http://${aws_instance.kafka_cluster.private_ip}:8081"
}
