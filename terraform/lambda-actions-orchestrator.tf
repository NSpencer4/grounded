module "actions_orchestrator" {
  source = "terraform-aws-modules/lambda/aws"
  version = "8.2.0"
  description = "Responsible for orchestrating actions."

  function_name = var.actions_orchestrator_fn_name
  runtime = "nodejs20.x"
  timeout = 60
  memory_size = 128

  publish = true
  create_package = false

  local_existing_package = "../packages/orchestrators/actions-orchestrator/dist/function.zip"

  vpc_subnet_ids = [
    aws_subnet.private_primary.id
    # uncomment if msk is enabled
    # aws_subnet.private_b.id
  ]
  vpc_security_group_ids = [aws_security_group.private_primary.id]

  attach_network_policy = true
  attach_policy_statements = true
  role_name = "${var.actions_orchestrator_fn_name}-role"

  policy_statements = {
    networking = {
      effect = "Allow"
      actions = [
        "ec2:CreateNetworkInterface",
        "ec2:AttachNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeVpcs",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
      ]
      resources = ["*"]
    }

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
      effect = "Allow"
      actions = [
        "secretsmanager:GetSecretValue"
      ]
      resources = [
        data.aws_secretsmanager_secret.supabase_key.arn
      ]
    }

    dynamo_access = {
      effect = "Allow"
      actions = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ]
      resources = [
        aws_dynamodb_table.dynamo.arn,
        "${aws_dynamodb_table.dynamo.arn}/index/*"
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
    Name = var.actions_orchestrator_fn_name
    Environment = var.environment
  }
}

module "actions_orchestrator_alias" {
  source = "terraform-aws-modules/lambda/aws//modules/alias"
  name = "current"
  description = "Current Version"

  function_name = module.actions_orchestrator.lambda_function_name
  function_version = module.actions_orchestrator.lambda_function_version
}

resource "aws_lambda_function_event_invoke_config" "grounded_actions_orchestrator_event_invoke_config" {
  function_name          = module.actions_orchestrator.lambda_function_name
  maximum_retry_attempts = 2
}