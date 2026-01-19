variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "grounded_actions_orchestrator_fn_name" {
  type = string
  default = "grounded-actions-orchestrator"
}

variable "grounded_conversation_commands_ddb_name" {
  type = string
  default = "grounded-conversation-commands"
}

variable "grounded_conversation_updates_ddb_name" {
  type = string
  default = "grounded-conversation-updates"
}