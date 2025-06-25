/*
 * Process Automation Trigger Configuration for TicketFlow
 * 
 * This file creates the trigger that starts the workflow when webhook events occur:
 * 
 * 1. Event Hook Trigger:
 *    - Listens for webhook invocations from the TicketFlow system
 *    - Matches events based on the webhook ID from the integration
 *    - Topic: v2.integrations.inbound.webhook.{id}.invocation
 * 
 * 2. Target Configuration:
 *    - Triggers the xperience2025_workflow when events are received
 *    - Passes JSON data to the workflow for processing
 *    - Type: Workflow (process automation workflow)
 * 
 * 3. Dependencies:
 *    - Depends on the webhook integration being created first
 *    - Uses the webhook ID from the integration for event matching
 * 
 * This trigger is the entry point that connects TicketFlow webhook events
 * to the Genesys Cloud workflow, enabling automated ticket processing.
 * 
 * Note: The webhook ID may be null on first deployment due to timing
 * dependencies, requiring a two-step deployment process.
 */

resource "genesyscloud_processautomation_trigger" "XPerience2025_-Event_Hook_Trigger" {
  match_criteria = "[{\"jsonPath\":\"webhookId\",\"operator\":\"Equal\",\"value\":\"${local.webhook_id}\"}]"
  name           = "XPerience2025_Event_Hook_Trigger-TF"
  
  target {
    id   = genesyscloud_flow.xperience2025_workflow.id
    type = "Workflow"
    workflow_target_settings {
      data_format = "Json"
    }
  }

  topic_name  = "v2.integrations.inbound.webhook.{id}.invocation"
  description = "Runs when the Event Hook is invoked"
  enabled     = true
  depends_on = [genesyscloud_integration.xPerience2025_eventhook]
}
