resource "aws_apprunner_vpc_connector" "conversation_updates_api_vpc" {
  vpc_connector_name = "conversation-updates-api-connector"
  subnets = [aws_subnet.private_primary.id]
  security_groups = [aws_security_group.private_primary.id, aws_security_group.cqrs_api_sg.id]
}

resource "aws_apprunner_service" "conversation_updates_api" {
  service_name = "conversation-updates-api"

  source_configuration {
    authentication_configuration {
      connection_arn = null
    }

    image_repository {
      image_identifier      = "public.ecr.aws/grounded/conversation-updates-api:latest"
      image_repository_type = "ECR_PUBLIC"
      image_configuration {
        port = "443"
      }
    }
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.conversation_updates_api_vpc.arn
    }
  }

  tags = {
    Name        = "conversation-updates-api"
    Environment = var.environment
  }
}
