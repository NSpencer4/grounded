variable "my_ip" {
  description = "Tester public IP for whitelisting"
  default     = "50.43.151.160/32"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  instance_tenancy     = "default"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

  tags = {
    Name = "grounded-public-subnet"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "public" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "grounded-internet-gateway"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.public.id
  }

  tags = {
    Name = "grounded-public-route-table"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id # public subnet for egress

  tags = {
    Name        = "grounded-nat-gateway"
    Environment = var.environment
  }

  # To ensure proper ordering
  depends_on = [aws_internet_gateway.public]
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "grounded-private-subnet-route-table"
    Environment = var.environment
  }
}

# NAT Gateway requires an Elastic IP
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name        = "grounded-nat-eip"
    Environment = var.environment
  }
}



resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = false


  tags = {
    Name = "grounded-private-subnet"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  # Local routing is implicit no need to explicitly define

  tags = {
    Name = "grounded-private-subnet-route-table"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}

# TODO: Testing purposes - remove when complete
resource "aws_security_group" "private_api_sg" {
  name        = "api-http-whitelist-external-ip"
  description = "Allow only my IP for API ingress"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow only my IP for ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "grounded-private-api-security-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "graphql_api_sg" {
  name        = "graphql-api-sg"
  description = "GraphQL API SG"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # public access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "grounded-graphql-api-security-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "cqrs_api_sg" {
  name        = "cqrs_api_sg"
  description = "Only allow GraphQL API ingress"
  vpc_id      = aws_vpc.main.id

  ingress {
    description      = "Only allow GraphQL API ingress"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    security_groups  = [aws_security_group.graphql_api_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "grounded-cqrs-api-security-group"
    Environment = var.environment
  }
}

resource "aws_security_group" "grounded_msk_sg" {
  name_prefix = "msk-sg-"
  description = "Security group for Grounded MSK cluster"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 2181
    to_port     = 2181
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  ingress {
    from_port   = 9094
    to_port     = 9094
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  ingress {
    from_port   = 9096
    to_port     = 9096
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "grounded-msk-security-group"
    Environment = var.environment
  }
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "private_subnet_id" {
  value = aws_subnet.private.id
}