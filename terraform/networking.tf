resource "aws_security_group" "lambdas" {
  name = "grounded-lambdas"
  description = "Grounded Lambdas"
  vpc_id = var.vpc_id

  egress {
    # All ports
    from_port = 0
    to_port = 0
    # All protocols
    protocol = "-1"
    # All IPV4 addreses
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = var.grounded_actions_orchestrator_fn_name
    Environment = var.environment
  }
}