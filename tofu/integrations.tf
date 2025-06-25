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

# Retrieve OAuth token using client credentials
data "http" "oauth_token" {
  url    = "https://login.usw2.pure.cloud/oauth/token"  # Dynamic login URL
  method = "POST"

  request_headers = {
    "Content-Type"  = "application/x-www-form-urlencoded"
    "Authorization" = "Basic ${base64encode("${local.oauthclient_id}:${local.oauthclient_secret}")}"
  }

  request_body = "grant_type=client_credentials"
}

# Fetch integration data
data "http" "integration" {
  url    = "https://api.usw2.pure.cloud/api/v2/integrations/${genesyscloud_integration.xPerience2025_eventhook.id}"  # Dynamic API URL
  method = "GET"

  request_headers = {
    "Authorization" = "Bearer ${jsondecode(data.http.oauth_token.response_body).access_token}"
    "Content-Type"  = "application/json"
  }
  depends_on = [genesyscloud_integration.xPerience2025_eventhook]
}

# # Parse webhookId from response
locals {
  oauthclient_id     = var.GENESYSCLOUD_OAUTHCLIENT_ID
  oauthclient_secret = var.GENESYSCLOUD_OAUTHCLIENT_SECRET
  integration_data   = jsondecode(data.http.integration.response_body)
  webhook_id         = try(local.integration_data.attributes.webhookId, null)
  webhook_url        = try(local.integration_data.attributes.invocationUrl, null)
  depends_on = [genesyscloud_integration.xPerience2025_eventhook]
}

 variable "GENESYSCLOUD_OAUTHCLIENT_ID" {
     type = string
     default = ""
  }

 variable "GENESYSCLOUD_OAUTHCLIENT_SECRET" {
     type = string
     default = ""
}

output "oauthclient_id" {
  description = "Genesys Cloud OAuth Client ID"
  value       = local.oauthclient_id
}

output "oauthclient_secret" {
  description = "Genesys Cloud OAuth Client Secret"
  value       = local.oauthclient_secret
  sensitive   = true  # Prevents plain-text display in logs/console
}

output "webhook_url" {
  description = "Genesys Cloud OAuth Client Secret"
  value       = local.webhook_url
}

resource "local_file" "environment_override" {
  content  = "VITE_WEBHOOK_URL=${local.webhook_url}"
  filename = "/Users/john.carnell/work/ticketflow/.env.development"
}