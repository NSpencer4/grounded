# Lambda Event Source Mappings for Self-Managed Kafka
# Triggers Lambdas when new events are published to Kafka topics

# =============================================================================
# Actions Orchestrator - Consumes conversation-commands and conversation-decisions
# =============================================================================

resource "aws_lambda_event_source_mapping" "actions_orchestrator_commands" {
  function_name = module.actions_orchestrator_alias.lambda_alias_arn

  topics = ["conversation-commands"]
  starting_position = "LATEST"
  batch_size        = 10

  self_managed_event_source {
    endpoints = {
      KAFKA_BOOTSTRAP_SERVERS = "${aws_instance.kafka_cluster.private_ip}:9092"
    }
  }

  source_access_configuration {
    type = "VPC_SUBNET"
    uri  = "subnet:${aws_subnet.private_primary.id}"
  }

  source_access_configuration {
    type = "VPC_SECURITY_GROUP"
    uri  = "security_group:${aws_security_group.private_primary.id}"
  }

  depends_on = [
    module.actions_orchestrator,
    aws_instance.kafka_cluster
  ]
}

resource "aws_lambda_event_source_mapping" "actions_orchestrator_decisions" {
  function_name = module.actions_orchestrator_alias.lambda_alias_arn

  topics = ["conversation-decisions"]
  starting_position = "LATEST"
  batch_size        = 10

  self_managed_event_source {
    endpoints = {
      KAFKA_BOOTSTRAP_SERVERS = "${aws_instance.kafka_cluster.private_ip}:9092"
    }
  }

  source_access_configuration {
    type = "VPC_SUBNET"
    uri  = "subnet:${aws_subnet.private_primary.id}"
  }

  source_access_configuration {
    type = "VPC_SECURITY_GROUP"
    uri  = "security_group:${aws_security_group.private_primary.id}"
  }

  depends_on = [
    module.actions_orchestrator,
    aws_instance.kafka_cluster
  ]
}

# =============================================================================
# Customer Spend Agent - Consumes conversation-evaluations
# =============================================================================

resource "aws_lambda_event_source_mapping" "customer_spend_agent_evaluations" {
  function_name = module.customer_spend_agent_alias.lambda_alias_arn

  topics = ["conversation-evaluations"]
  starting_position = "LATEST"
  batch_size        = 5

  # Filter to only process evaluations for this agent type
  filter_criteria {
    filter {
      pattern = jsonencode({
        value = {
          evaluationType = ["CUSTOMER_SPEND_ANALYSIS"]
        }
      })
    }
  }

  self_managed_event_source {
    endpoints = {
      KAFKA_BOOTSTRAP_SERVERS = "${aws_instance.kafka_cluster.private_ip}:9092"
    }
  }

  source_access_configuration {
    type = "VPC_SUBNET"
    uri  = "subnet:${aws_subnet.private_primary.id}"
  }

  source_access_configuration {
    type = "VPC_SECURITY_GROUP"
    uri  = "security_group:${aws_security_group.private_primary.id}"
  }

  depends_on = [
    module.customer_spend_agent,
    aws_instance.kafka_cluster
  ]
}

# =============================================================================
# Response Recommendation Agent - Consumes conversation-evaluations
# =============================================================================

resource "aws_lambda_event_source_mapping" "response_recommendation_agent_evaluations" {
  function_name = module.response_recommendation_agent_alias.lambda_alias_arn

  topics = ["conversation-evaluations"]
  starting_position = "LATEST"
  batch_size        = 5

  # Filter to only process evaluations for this agent type
  filter_criteria {
    filter {
      pattern = jsonencode({
        value = {
          evaluationType = ["RESPONSE_RECOMMENDATION"]
        }
      })
    }
  }

  self_managed_event_source {
    endpoints = {
      KAFKA_BOOTSTRAP_SERVERS = "${aws_instance.kafka_cluster.private_ip}:9092"
    }
  }

  source_access_configuration {
    type = "VPC_SUBNET"
    uri  = "subnet:${aws_subnet.private_primary.id}"
  }

  source_access_configuration {
    type = "VPC_SECURITY_GROUP"
    uri  = "security_group:${aws_security_group.private_primary.id}"
  }

  depends_on = [
    module.response_recommendation_agent,
    aws_instance.kafka_cluster
  ]
}

# =============================================================================
# Responder - Consumes conversation-assertions
# =============================================================================

resource "aws_lambda_event_source_mapping" "responder_assertions" {
  function_name = module.responder_alias.lambda_alias_arn

  topics = ["conversation-assertions"]
  starting_position = "LATEST"
  batch_size        = 10

  self_managed_event_source {
    endpoints = {
      KAFKA_BOOTSTRAP_SERVERS = "${aws_instance.kafka_cluster.private_ip}:9092"
    }
  }

  source_access_configuration {
    type = "VPC_SUBNET"
    uri  = "subnet:${aws_subnet.private_primary.id}"
  }

  source_access_configuration {
    type = "VPC_SECURITY_GROUP"
    uri  = "security_group:${aws_security_group.private_primary.id}"
  }

  depends_on = [
    module.responder,
    aws_instance.kafka_cluster
  ]
}
