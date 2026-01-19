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

