/*
 * Terraform Provider Configuration for TicketFlow
 * 
 * This file configures the Terraform providers required for the TicketFlow
 * infrastructure deployment. It sets up the foundation for all Genesys Cloud
 * interactions and external API communications.
 * 
 * PROVIDERS CONFIGURED:
 * 
 * 1. Genesys Cloud Provider (mypurecloud/genesyscloud)
 *    - Primary provider for all Genesys Cloud resource management
 *    - Enables SDK debugging for troubleshooting and development
 *    - Manages integrations, workflows, queues, and data actions
 *    - Requires OAuth client credentials for authentication
 * 
 * 2. HTTP Provider (hashicorp/http)
 *    - Used for making HTTP requests during deployment
 *    - Handles OAuth token retrieval and validation
 *    - Supports webhook testing and external API calls
 *    - Version locked to ~> 3.4 for stability
 * 
 * DEPENDENCIES:
 * - Requires TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID environment variable
 * - Requires TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET environment variable
 * - These are validated in variables.tf using Terraform checks
 * 
 * USAGE:
 * This configuration is automatically loaded by Terraform and provides
 * the foundation for all other .tf files in this project. The providers
 * enable the creation and management of Genesys Cloud resources including
 * webhook integrations, routing queues, workflows, and data actions.
 * 
 * DEBUGGING:
 * SDK debugging is enabled to help troubleshoot API interactions and
 * identify issues during deployment. Debug logs are written to sdk_debug.log.
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