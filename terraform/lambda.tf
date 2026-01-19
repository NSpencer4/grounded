module "grounded_actions_orchestrator" {
  source = "terraform-aws-modules/lambda/aws"
  version = "8.2.0"
  description = "Responsible for orchestrating actions."

  function_name = var.grounded_actions_orchestrator_fn_name
  runtime = "nodejs20.x"
  timeout = 60
  memory_size = 128

  publish = true
  create_package = false

  local_existing_package = "../packages/orchestrators/actions-orchestrator/dist/function.zip"

  vpc_subnet_ids = [aws_subnet.public.id]
  vpc_security_group_ids = [aws_security_group.lambdas.id]

  attach_network_policy = true
  attach_policy_statements = true
  role_name = "${var.grounded_actions_orchestrator_fn_name}-role"

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
      resources = [*]
    },
    fetch_secrets = {
      effect = "Allow",
      actions = [
        "secretsmanager:GetSecretValue"
      ],
      resources = [
#         TODO: Fix this
        data.aws_secretsmanager_secret.supabase_key.arn
      ]
    }
  },

  environment_variables = {
    ENVIRONMENT = var.environment
  }

  tags = {
    Name = var.grounded_actions_orchestrator_fn_name
    Environment = var.environment
  }
}

module "grounded_actions_orchestrator_alias" {
  source = "terraform-aws-modules/lambda/aws//modules/alias"
  name = "current"
  description = "Current Version"

  function_name = module.grounded_actions_orchestrator.lambda_function_name
  function_version = module.grounded_actions_orchestrator.lambda_function_version
}

resource "aws_lambda_provisioned_concurrency_config" "grounded_actions_orchestrator_provisioned_concurrency_config" {
  function_name = module.grounded_actions_orchestrator.lambda_function_name
  provisioned_concurrent_executions = 0
  qualifier                         = module.grounded_actions_orchestrator_alias.lambda_alias_name
}

resource "aws_lambda_function_event_invoke_config" "grounded_actions_orchestrator_event_invoke_config" {
  function_name = module.grounded_actions_orchestrator.lambda_function_name
  maximum_retry_attempts = 3
}

# TODO: Setup MSK
# resource "aws_lambda_event_source_mapping" "grounded_actions_orchestrator_event_source_mapping" {
#   function_name = module.grounded_actions_orchestrator_alias.lambda_alias_arn
#   topics = ["conversation-commands"]
#   starting_position = "LATEST"
#   batch_size = 10
# }