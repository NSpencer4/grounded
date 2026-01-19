resource "aws_apprunner_vpc_connector" "graphql_api_vpc" {
  vpc_connector_name = "graphql-api-connector"
  subnets = [aws_subnet.private.id]
  security_groups    = [aws_security_group.private_api_sg.id, aws_security_group.graphql_api_sg.id]
}

resource "aws_apprunner_service" "graphql_api" {
  service_name = "graphql-api"

  source_configuration {
    authentication_configuration {
      connection_arn = null
    }

    image_repository {
      image_identifier      = "public.ecr.aws/graphql-api-image:latest"
      image_repository_type = "ECR_PUBLIC"
      image_configuration {
        port = "443"
      }
    }
  }

  network_configuration {
    egress_configuration {
      egress_type = "DEFAULT" # public internet
    }
  }

  tags = {
    Name = "graphql-api"
    Environment = var.environment
  }
}

