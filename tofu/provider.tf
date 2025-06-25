/*
 * Terraform Provider Configuration for TicketFlow
 * 
 * This file configures the Terraform providers required for the TicketFlow
 * infrastructure deployment. It sets up:
 * 
 * 1. Genesys Cloud Provider: The main provider for interacting with Genesys Cloud
 *    - Source: mypurecloud/genesyscloud
 *    - Enables SDK debugging for troubleshooting
 * 
 * 2. HTTP Provider: Used for making HTTP requests during deployment
 *    - Source: hashicorp/http
 *    - Version: ~> 3.4
 *    - Used for webhook validation and external API calls
 * 
 * This configuration is required for all other Terraform files in this project
 * to function properly with Genesys Cloud services.
 */

terraform {
  required_providers {
    genesyscloud = {
      source = "mypurecloud/genesyscloud"
    }
    
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }
}

provider "genesyscloud" {
    sdk_debug = true
}