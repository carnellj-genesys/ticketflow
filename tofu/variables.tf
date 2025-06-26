/*
 * Terraform Variables Configuration for TicketFlow
 * 
 * This file defines input variables for the TicketFlow Terraform configuration.
 * These variables provide flexibility and security for environment-specific
 * configuration values and authentication credentials.
 * 
 * VARIABLES DEFINED:
 * 
 * 1. GENESYSCLOUD_OAUTHCLIENT_ID (string)
 *    - Purpose: OAuth client ID for Genesys Cloud API authentication
 *    - Default: Empty string (must be provided via environment variable)
 *    - Usage: Used by the data actions integration module
 *    - Security: Should be provided via TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID
 * 
 * 2. GENESYSCLOUD_OAUTHCLIENT_SECRET (string)
 *    - Purpose: OAuth client secret for Genesys Cloud API authentication
 *    - Default: Empty string (must be provided via environment variable)
 *    - Usage: Used by the data actions integration module
 *    - Security: Should be provided via TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET
 * 
 * LOCALS DEFINED:
 * 
 * 1. oauthclient_id (string)
 *    - Maps to GENESYSCLOUD_OAUTHCLIENT_ID variable
 *    - Used throughout the configuration for consistency
 * 
 * 2. oauthclient_secret (string)
 *    - Maps to GENESYSCLOUD_OAUTHCLIENT_SECRET variable
 *    - Used throughout the configuration for consistency
 * 
 * 3. depends_on (list)
 *    - Defines dependency on the webhook integration
 *    - Ensures proper resource creation order
 * 
 * VALIDATION:
 * - Environment variables are validated using Terraform checks in integrations.tf
 * - Both OAuth credentials must be provided for the deployment to succeed
 * - Empty values will cause the deployment to fail with a clear error message
 * 
 * USAGE:
 * These variables are used by the data actions integration module to authenticate
 * with Genesys Cloud APIs and enable the creation of custom data actions for
 * SMS messaging and callback creation.
 */

 variable "GENESYSCLOUD_OAUTHCLIENT_ID" {
     type = string
     default = ""
  }

 variable "GENESYSCLOUD_OAUTHCLIENT_SECRET" {
     type = string
     default = ""
 }


locals {
  oauthclient_id     = var.GENESYSCLOUD_OAUTHCLIENT_ID
  oauthclient_secret = var.GENESYSCLOUD_OAUTHCLIENT_SECRET
  depends_on = [genesyscloud_integration.xPerience2025_eventhook]
}