/*
 * Data Actions Configuration for TicketFlow Integration
 * 
 * This file defines Genesys Cloud integration actions that enable the TicketFlow system
 * to interact with Genesys Cloud services. It creates two main data actions:
 * 
 * 1. Xperience2025-CreateCallback: Creates callback requests in Genesys Cloud
 *    - Allows the system to schedule callbacks for customers
 *    - Takes queue ID and callback phone number as input
 *    - Posts to the Genesys Cloud callback API endpoint
 * 
 * 2. Xperience2025_AgentlessSMS: Sends SMS messages without agent intervention
 *    - Enables automated SMS notifications to customers
 *    - Takes message body, from number, and to number as input
 *    - Posts to the Genesys Cloud agentless messaging API
 * 
 * Both actions are part of the "XPerience2025-Integration-TF" category and
 * are associated with the main integration module defined in integrations.tf.
 * These actions are used by the workflow defined in flows.tf to automate
 * customer communication when tickets are created or updated.
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