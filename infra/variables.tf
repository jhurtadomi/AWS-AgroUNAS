variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto (prefijo)"
  type        = string
  default     = "agromarket"
}

variable "vpc_cidr" {
  description = "CIDR de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets" {
  description = "Subredes públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "cluster_version" {
  description = "Versión de EKS"
  type        = string
  default     = "1.28"
}

# 🔹 NUEVO: variables que estamos pasando desde GitHub Actions
variable "image_tag" {
  description = "Tag de la imagen Docker a desplegar"
  type        = string
}

variable "image_repo" {
  description = "URI del repositorio ECR + nombre del repositorio"
  type        = string
}
