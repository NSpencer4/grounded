# ============================================================================
# JWT Secret for Organization API
# ============================================================================

data "aws_secretsmanager_secret" "jwt_secret" {
  name = "grounded/jwt-secret"
}

data "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = data.aws_secretsmanager_secret.jwt_secret.id
}
