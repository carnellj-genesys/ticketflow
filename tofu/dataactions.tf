/*
 * Data Actions Configuration for TicketFlow Integration
 * 
 * This file defines Genesys Cloud integration actions that enable the TicketFlow system
 * to interact with Genesys Cloud services through custom API calls. These data actions
 * provide the communication capabilities for automated customer interactions.
 * 
 * DATA ACTIONS CREATED:
 * 
 * 1. Create Callback Action (genesyscloud_integration_action.Xperience2025-CreateCallback)
 *    - Purpose: Creates callback requests in Genesys Cloud for customer contact
 *    - API Endpoint: POST /api/v2/conversations/callbacks
 *    - Category: XPerience2025-Integration-TF
 *    - Integration: Uses the data actions integration module
 *    - Security: Non-secure (uses standard API authentication)
 * 
 *    Input Contract:
 *    - callbackNumber (string): Customer phone number for callback
 *    - queueId (string): Target queue ID for callback routing
 * 
 *    Output Contract:
 *    - Returns raw API response from Genesys Cloud
 *    - Additional properties allowed for flexibility
 * 
 *    Request Template:
 *    - JSON payload with queueId and callbackNumbers array
 *    - Uses Terraform variable substitution for dynamic values
 * 
 * 2. Agentless SMS Action (genesyscloud_integration_action.Xperience2025_AgentlessSMS)
 *    - Purpose: Sends SMS messages without agent intervention
 *    - API Endpoint: POST /api/v2/conversations/messages/agentless
 *    - Category: XPerience2025-Integration-TF
 *    - Integration: Uses the data actions integration module
 *    - Security: Non-secure (uses standard API authentication)
 * 
 *    Input Contract:
 *    - BODY (string): SMS message content
 *    - FromMOBILE (string): Sender phone number
 *    - MOBILE (string): Recipient phone number
 * 
 *    Output Contract:
 *    - conversationId (string): Generated conversation identifier
 *    - fromAddress (string): Sender address used
 *    - id (string): Message identifier
 *    - messengerType (string): Type of messaging (sms)
 *    - selfUri (string): API reference URI
 *    - textBody (string): Message content sent
 *    - timestamp (string): Message timestamp
 *    - toAddress (string): Recipient address
 *    - user (object): User information with id and selfUri
 * 
 *    Request Template:
 *    - JSON payload with fromAddress, toAddress, messengerType, and textBody
 *    - Content-Type header set to application/json
 *    - Uses Terraform variable substitution for dynamic values
 * 
 * INTEGRATION DETAILS:
 * 
 * - Both actions are part of the "XPerience2025-Integration-TF" category
 * - Associated with the main integration module from integrations.tf
 * - Use OAuth authentication through the integration module
 * - Support additional properties for API response flexibility
 * - Include success templates that return raw API responses
 * 
 * WORKFLOW INTEGRATION:
 * 
 * These data actions are used by the workflow defined in flows.tf to:
 * - Send automated SMS notifications when tickets are created/updated
 * - Create callback requests for customer contact
 * - Enable multi-channel communication capabilities
 * - Provide real-time customer engagement
 * 
 * API ENDPOINTS:
 * 
 * 1. Callback API: /api/v2/conversations/callbacks
 *    - Creates callback requests in Genesys Cloud
 *    - Routes callbacks to specified queues
 *    - Enables automated customer contact scheduling
 * 
 * 2. Agentless Messaging API: /api/v2/conversations/messages/agentless
 *    - Sends SMS messages without agent involvement
 *    - Supports automated notifications
 *    - Enables proactive customer communication
 * 
 * SECURITY AND AUTHENTICATION:
 * - Both actions use OAuth client credentials authentication
 * - Credentials provided through the integration module
 * - Non-secure flag allows standard API access
 * - All communications use HTTPS
 * 
 * USAGE IN TICKETFLOW:
 * These actions enable the TicketFlow system to:
 * - Automatically notify customers of ticket status changes
 * - Schedule callbacks for urgent ticket resolution
 * - Provide multi-channel customer support
 * - Integrate seamlessly with Genesys Cloud contact center capabilities
 */

resource "genesyscloud_integration_action" "Xperience2025-CreateCallback" {
  category = "XPerience2025-Integration-TF"
  config_request {
    request_type         = "POST"
    request_url_template = "/api/v2/conversations/callbacks"
    request_template     = "{\"queueId\": \"$${input.queueId}\",\"callbackNumbers\": [\"$${input.callbackNumber}\"]}"
  }
  contract_input = jsonencode({
		"additionalProperties": true,
		"properties": {
				"callbackNumber": {
						"type": "string"
				},
				"queueId": {
						"type": "string"
				}
		},
		"title": "Request",
		"type": "object"
	})
  integration_id = "${module.xPerience2025_DataAction_Integration.integration_id}"
  name           = "Xperience2025-CreateCallback-TF"
  config_response {
    success_template = "$${rawResult}"
  }
  contract_output = jsonencode({
		"additionalProperties": true,
		"properties": {},
		"type": "object"
	})
  secure          = false
}

resource "genesyscloud_integration_action" "Xperience2025_AgentlessSMS" {
  contract_input  = jsonencode({
		"additionalProperties": true,
		"properties": {
				"BODY": {
						"type": "string"
				},
				"FromMOBILE": {
						"type": "string"
				},
				"MOBILE": {
						"type": "string"
				}
		},
		"title": "body",
		"type": "object"
	})
  integration_id  = "${module.xPerience2025_DataAction_Integration.integration_id}"
  name            = "Xperience2025_AgentlessSMS-TF"
  contract_output = jsonencode({
		"additionalProperties": true,
		"properties": {
				"conversationId": {
						"type": "string"
				},
				"fromAddress": {
						"type": "string"
				},
				"id": {
						"type": "string"
				},
				"messengerType": {
						"type": "string"
				},
				"selfUri": {
						"type": "string"
				},
				"textBody": {
						"type": "string"
				},
				"timestamp": {
						"type": "string"
				},
				"toAddress": {
						"type": "string"
				},
				"user": {
						"additionalProperties": true,
						"properties": {
								"id": {
										"type": "string"
								},
								"selfUri": {
										"type": "string"
								}
						},
						"type": "object"
				}
		},
		"title": "SendAgentlessOutboundMessageResponse",
		"type": "object"
	})
  secure          = false
  category = "XPerience2025-Integration-TF"
  config_request {
    headers = {
      Content-Type = "application/json"
    }
    request_template     = "{  \"fromAddress\": \"$input.FromMOBILE\", \"toAddress\": \"$${input.MOBILE}\", \"toAddressMessengerType\": \"sms\", \"textBody\": \"$${input.BODY}\"  }"
    request_type         = "POST"
    request_url_template = "/api/v2/conversations/messages/agentless"
  }
  config_response {
    success_template = "$${rawResult}"
  }
}