# Customer Spend Agent Lambda
module "customer_spend_agent" {
  source      = "terraform-aws-modules/lambda/aws"
  version     = "8.2.0"
  description = "AI agent that analyzes customer spending data."

  function_name = var.customer_spend_agent_fn_name
  runtime       = "nodejs20.x"
  timeout       = 120
  memory_size   = 256

  publish        = true
  create_package = false

  local_existing_package = "../packages/server/agents/customer-spend-agent/dist/function.zip"

  vpc_subnet_ids = [aws_subnet.private_primary.id]
  vpc_security_group_ids = [aws_security_group.private_primary.id]

  attach_network_policy    = true
  attach_policy_statements = true
  role_name                = "${var.customer_spend_agent_fn_name}-role"

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

    receive_messages = {
      effect = "Allow"
      actions = [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:ListTopics",
        "kafka:Consume"
      ]
      resources = ["*"]
    }

    send_messages = {
      effect = "Allow"
      actions = [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:ListTopics",
        "kafka:Produce"
      ]
      resources = ["*"]
    }

    fetch_secrets = {
      effect = "Allow",
      actions = [
        "secretsmanager:GetSecretValue"
      ],
      resources = [
        data.aws_secretsmanager_secret.anthropic_api_key.arn
      ]
    }
  }

  environment_variables = {
    ENVIRONMENT         = var.environment
    DYNAMO_TABLE        = var.ddb_name
    KAFKA_BROKER        = aws_instance.kafka_cluster.private_ip
    SCHEMA_REGISTRY_URL = "http://${aws_instance.kafka_cluster.private_ip}:8081"
  }

  tags = {
    Name        = var.customer_spend_agent_fn_name
    Environment = var.environment
  }
}

module "customer_spend_agent_alias" {
  source      = "terraform-aws-modules/lambda/aws//modules/alias"
  name        = "current"
  description = "Current Version"

  function_name    = module.customer_spend_agent.lambda_function_name
  function_version = module.customer_spend_agent.lambda_function_version
}

# Response Recommendation Agent Lambda
module "response_recommendation_agent" {
  source      = "terraform-aws-modules/lambda/aws"
  version     = "8.2.0"
  description = "AI agent that generates response recommendations."

  function_name = var.response_recommendation_agent_fn_name
  runtime       = "nodejs20.x"
  timeout       = 120
  memory_size   = 256

  publish        = true
  create_package = false

  local_existing_package = "../packages/server/agents/response-recommendation-agent/dist/function.zip"

  vpc_subnet_ids = [aws_subnet.private_primary.id]
  vpc_security_group_ids = [aws_security_group.private_primary.id]

  attach_network_policy    = true
  attach_policy_statements = true
  role_name                = "${var.response_recommendation_agent_fn_name}-role"

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

    receive_messages = {
      effect = "Allow"
      actions = [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:ListTopics",
        "kafka:Consume"
      ]
      resources = ["*"]
    }

    send_messages = {
      effect = "Allow"
      actions = [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:ListTopics",
        "kafka:Produce"
      ]
      resources = ["*"]
    }

    fetch_secrets = {
      effect = "Allow",
      actions = [
        "secretsmanager:GetSecretValue"
      ],
      resources = [
        data.aws_secretsmanager_secret.anthropic_api_key.arn
      ]
    }
  }

  environment_variables = {
    ENVIRONMENT         = var.environment
    DYNAMO_TABLE        = var.ddb_name
    KAFKA_BROKER        = aws_instance.kafka_cluster.private_ip
    SCHEMA_REGISTRY_URL = "http://${aws_instance.kafka_cluster.private_ip}:8081"
  }

  tags = {
    Name        = var.response_recommendation_agent_fn_name
    Environment = var.environment
  }
}

module "response_recommendation_agent_alias" {
  source      = "terraform-aws-modules/lambda/aws//modules/alias"
  name        = "current"
  description = "Current Version"

  function_name    = module.response_recommendation_agent.lambda_function_name
  function_version = module.response_recommendation_agent.lambda_function_version
}
