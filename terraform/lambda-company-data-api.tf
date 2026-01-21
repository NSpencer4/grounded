# Company Data Lambda (Node.js Monolith)
# Single Lambda serving as the organizational data source with PostgreSQL
# Accessed by evaluators via MCP Server tools
module "company_data_api" {
  source      = "terraform-aws-modules/lambda/aws"
  version     = "8.2.0"
  description = "Organizational data source for customer info, billing, orders, subscriptions."

  function_name = var.company_data_api_fn_name
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  publish        = true
  create_package = false

  local_existing_package = "../packages/server/apis/company-data-api/dist/function.zip"

  vpc_subnet_ids = [aws_subnet.private_primary.id]
  vpc_security_group_ids = [aws_security_group.private_primary.id, aws_security_group.rds_security_group.id]

  attach_network_policy    = true
  attach_policy_statements = true
  role_name                = "${var.company_data_api_fn_name}-role"

  policy_statements = {
    networking = {
      effect = "Allow",
      actions = [
        "ec2:CreateNetworkInterface",
        "ec2:AttachNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeVpcs",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
      ],
      resources = ["*"]
    },

    fetch_secrets = {
      effect = "Allow",
      actions = [
        "secretsmanager:GetSecretValue"
      ],
      resources = [
        data.aws_secretsmanager_secret.conversation_evaluation_db_password.arn
      ]
    }
  }

  environment_variables = {
    ENVIRONMENT = var.environment
    DB_HOST     = aws_db_instance.conversation_evaluations.address
    DB_PORT     = aws_db_instance.conversation_evaluations.port
    DB_NAME     = aws_db_instance.conversation_evaluations.db_name
    DB_USER     = aws_db_instance.conversation_evaluations.username
  }

  tags = {
    Name        = var.company_data_api_fn_name
    Environment = var.environment
  }
}

module "company_data_api_alias" {
  source      = "terraform-aws-modules/lambda/aws//modules/alias"
  name        = "current"
  description = "Current Version"

  function_name    = module.company_data_api.lambda_function_name
  function_version = module.company_data_api.lambda_function_version
}

# Lambda Function URL for MCP Server access
resource "aws_lambda_function_url" "company_data_api_url" {
  function_name      = module.company_data_api.lambda_function_name
  authorization_type = "AWS_IAM"
}

output "company_data_api_url" {
  value       = aws_lambda_function_url.company_data_api_url.function_url
  description = "URL for Company Data API Lambda"
}
