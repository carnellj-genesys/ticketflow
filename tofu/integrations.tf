/*
 * Genesys Cloud Integration Configuration for TicketFlow
 * 
 * This file sets up the core integrations between TicketFlow and Genesys Cloud,
 * establishing the foundation for webhook-based communication and API access.
 * It creates the primary webhook integration, configures OAuth authentication,
 * and sets up the data actions integration module.
 * 
 * RESOURCES CREATED:
 * 
 * 1. Webhook Integration (genesyscloud_integration.xPerience2025_eventhook)
 *    - Type: Webhook integration for receiving events
 *    - Rate Limit: 200 invocations per minute
 *    - Purpose: Receives ticket data from TicketFlow application
 *    - State: Enabled and ready for webhook invocations
 *    - Naming: Uses "-TF" suffix for Terraform management
 * 
 * 2. Webhook Data Source (genesyscloud_integration_webhook.xPerience2025_eventhook_info)
 *    - Purpose: Retrieves webhook URL and ID after creation
 *    - Dependencies: Depends on webhook integration creation
 *    - Usage: Provides webhook URL for TicketFlow configuration
 *    - Note: May return null on first run due to timing dependencies
 * 
 * 3. Data Actions Integration Module (module.xPerience2025_DataAction_Integration)
 *    - Source: Genesys Cloud DevOps public module (v1.0.0)
 *    - Purpose: Enables custom API actions within Genesys Cloud
 *    - Authentication: Uses OAuth client credentials
 *    - Integration: Creates the foundation for data actions in dataactions.tf
 * 
 * 4. Environment Configuration (local_file.environment_override)
 *    - File: .env.development in TicketFlow project root
 *    - Content: VITE_WEBHOOK_URL with generated webhook URL
 *    - Purpose: Automatically configures TicketFlow with webhook endpoint
 *    - Updates: Overwrites file on each deployment
 * 
 * VALIDATION:
 * 
 * 1. Environment Variables Check (check.required_env_vars)
 *    - Validates TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID is set
 *    - Validates TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET is set
 *    - Fails deployment if either credential is missing
 *    - Provides clear error message for missing variables
 * 
 * DEPENDENCIES:
 * - Requires OAuth client credentials from environment variables
 * - Webhook data source depends on webhook integration creation
 * - Environment file depends on webhook URL retrieval
 * 
 * USAGE:
 * This integration setup enables:
 * - Real-time webhook communication between TicketFlow and Genesys Cloud
 * - Secure OAuth-based API access for data actions
 * - Automatic configuration of TicketFlow application
 * - Foundation for workflow automation and ticket processing
 * 
 * SECURITY:
 * - OAuth credentials validated before deployment
 * - Webhook URLs automatically generated and secured
 * - Environment variables used for sensitive data
 * - Integration names include "-TF" suffix for identification
 */

resource "genesyscloud_integration" "xPerience2025_eventhook" {
  intended_state = "ENABLED"
  config {
    name       = "xPerience2025_eventhook-TF"
    notes      = "event hook the experience conference"
    properties = jsonencode({
			"invocationRatePerMinute": 200
		})
    advanced   = jsonencode({		})
  }
  integration_type = "webhook"
}

data "genesyscloud_integration_webhook" "xPerience2025_eventhook_info" {
  name = "xPerience2025_eventhook-TF"
  depends_on = [genesyscloud_integration.xPerience2025_eventhook]
}

module "xPerience2025_DataAction_Integration" {
    source = "git::https://github.com/GenesysCloudDevOps/public-api-data-actions-integration-module.git?ref=v1.0.0"

    integration_name                = "xPerience2025_DataAction_Integrations-TF"
    integration_creds_client_id     = var.GENESYSCLOUD_OAUTHCLIENT_ID
    integration_creds_client_secret = var.GENESYSCLOUD_OAUTHCLIENT_SECRET
}


check "required_env_vars" {
  assert {
    condition     = local.oauthclient_id != "" && local.oauthclient_secret != ""
    error_message = "Environment variables TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID, and TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET must be set."
  }
}




resource "local_file" "environment_override" {
  content  = "VITE_WEBHOOK_URL=${data.genesyscloud_integration_webhook.xPerience2025_eventhook_info.invocation_url}"
  filename = "/Users/john.carnell/work/ticketflow/.env.development"
}