# Lambda Supabase Integration
# 
# This file attaches the Supabase secrets access policy to Lambda functions
# that need authentication capabilities.

# Attach Supabase secrets policy to Actions Orchestrator
resource "aws_iam_role_policy_attachment" "actions_orchestrator_supabase" {
  role       = aws_iam_role.actions_orchestrator.name
  policy_arn = aws_iam_policy.supabase_secrets_access.arn
  
  depends_on = [
    aws_iam_policy.supabase_secrets_access
  ]
}

# Attach Supabase secrets policy to Responder Lambda
resource "aws_iam_role_policy_attachment" "responder_supabase" {
  role       = aws_iam_role.responder.name
  policy_arn = aws_iam_policy.supabase_secrets_access.arn
  
  depends_on = [
    aws_iam_policy.supabase_secrets_access
  ]
}

# Attach Supabase secrets policy to Customer Spend Agent
resource "aws_iam_role_policy_attachment" "customer_spend_agent_supabase" {
  role       = aws_iam_role.customer_spend_agent.name
  policy_arn = aws_iam_policy.supabase_secrets_access.arn
  
  depends_on = [
    aws_iam_policy.supabase_secrets_access
  ]
}

# Attach Supabase secrets policy to Response Recommendation Agent
resource "aws_iam_role_policy_attachment" "response_recommendation_agent_supabase" {
  role       = aws_iam_role.response_recommendation_agent.name
  policy_arn = aws_iam_policy.supabase_secrets_access.arn
  
  depends_on = [
    aws_iam_policy.supabase_secrets_access
  ]
}

# Add SUPABASE_CREDENTIALS_SECRET_ARN environment variable to Lambda functions

# Update Actions Orchestrator environment variables
resource "aws_lambda_function_environment" "actions_orchestrator_supabase" {
  function_name = aws_lambda_function.actions_orchestrator.function_name
  
  environment {
    variables = merge(
      aws_lambda_function.actions_orchestrator.environment[0].variables,
      {
        SUPABASE_CREDENTIALS_SECRET_ARN = aws_secretsmanager_secret.supabase_credentials.arn
      }
    )
  }
  
  depends_on = [
    aws_lambda_function.actions_orchestrator
  ]
}

# Update Responder Lambda environment variables
resource "aws_lambda_function_environment" "responder_supabase" {
  function_name = aws_lambda_function.responder.function_name
  
  environment {
    variables = merge(
      aws_lambda_function.responder.environment[0].variables,
      {
        SUPABASE_CREDENTIALS_SECRET_ARN = aws_secretsmanager_secret.supabase_credentials.arn
      }
    )
  }
  
  depends_on = [
    aws_lambda_function.responder
  ]
}

# Note: Add similar blocks for other Lambda functions as needed

# Output for verification
output "lambda_supabase_integration_status" {
  description = "Status of Lambda Supabase integration"
  value = {
    policy_arn = aws_iam_policy.supabase_secrets_access.arn
    secret_arn = aws_secretsmanager_secret.supabase_credentials.arn
    lambdas_configured = [
      aws_lambda_function.actions_orchestrator.function_name,
      aws_lambda_function.responder.function_name,
      aws_lambda_function.customer_spend_agent.function_name,
      aws_lambda_function.response_recommendation_agent.function_name,
    ]
  }
}
