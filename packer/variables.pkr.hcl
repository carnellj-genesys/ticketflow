variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
  default     = env("DOCTL_API_KEY")
}

variable "do_region" {
  description = "DigitalOcean region for the droplet"
  type        = string
  default     = "nyc1"
}

variable "do_size" {
  description = "DigitalOcean droplet size"
  type        = string
  default     = "s-1vcpu-512mb-10gb"
}

variable "do_image" {
  description = "DigitalOcean base image (Ubuntu 22.04 LTS)"
  type        = string
  default     = "ubuntu-22-04-x64"
}

variable "droplet_name" {
  description = "Name for the droplet"
  type        = string
  default     = "ticketflow-docker-droplet"
}

variable "ssh_username" {
  description = "SSH username for the droplet"
  type        = string
  default     = "root"
}

variable "docker_version" {
  description = "Docker version to install"
  type        = string
  default     = "24.0.7"
}

variable "docker_compose_version" {
  description = "Docker Compose version to install"
  type        = string
  default     = "2.23.3"
}

variable "timeout" {
  description = "Timeout for the build process"
  type        = string
  default     = "30m"
}

variable "ngrok_auth_token" {
  description = "ngrok authentication token"
  type        = string
  sensitive   = true
  default     = env("NGROK_AUTH_TOKEN")
}

variable "ssh_key_id" {
  description = "DigitalOcean SSH key ID"
  type        = string
  default     = env("SSH_KEY_ID")
}