variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "arithimancia-api"
}

variable "stage" {
  description = "Stage (dev, prod)"
  type        = string
  default     = "dev"
}

variable "database_url" {
  description = "Database Connection URL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}

variable "jwt_access_expires_in" {
  description = "JWT Access Token Expiration"
  type        = string
  default     = "15m"
}

variable "jwt_refresh_expires_in" {
  description = "JWT Refresh Token Expiration"
  type        = string
  default     = "7d"
}
