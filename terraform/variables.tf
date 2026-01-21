variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "vpc_name" {
  type = string
  default = "grounded-main-vpc"
}

variable "subnet_ids" {
  type = list(string)
}

variable "actions_orchestrator_fn_name" {
  type = string
  default = "grounded-actions-orchestrator"
}

variable "ddb_name" {
  type = string
  default = "grounded-datastore"
}

variable "responder_fn_name" {
  type    = string
  default = "grounded-responder"
}

variable "customer_spend_agent_fn_name" {
  type    = string
  default = "grounded-customer-spend-agent"
}

variable "response_recommendation_agent_fn_name" {
  type    = string
  default = "grounded-response-recommendation-agent"
}

variable "company_data_api_fn_name" {
  type    = string
  default = "grounded-company-data-api"
}

