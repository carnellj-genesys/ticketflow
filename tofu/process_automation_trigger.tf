/*
 * Process Automation Trigger Configuration for TicketFlow
 * 
 * This file creates the trigger that starts the workflow when webhook events occur.
 * The trigger serves as the entry point that connects TicketFlow webhook events to
 * the Genesys Cloud workflow, enabling automated ticket processing and customer engagement.
 * 
 * TRIGGER RESOURCE:
 * 
 * 1. Event Hook Trigger (genesyscloud_processautomation_trigger.XPerience2025_-Event_Hook_Trigger)
 *    - Name: "XPerience2025_Event_Hook_Trigger-TF"
 *    - Topic: v2.integrations.inbound.webhook.{id}.invocation
 *    - Purpose: Listens for webhook invocations from TicketFlow application
 *    - State: Enabled and actively monitoring for events
 *    - Type: Process automation trigger for workflow execution
 * 
 * TRIGGER CONFIGURATION:
 * 
 * 1. Match Criteria
 *    - JSON Path: "webhookId"
 *    - Operator: "Equal"
 *    - Value: Dynamic webhook ID from integration
 *    - Purpose: Filters events to only those from the specific webhook
 *    - Format: JSON array with matching criteria object
 * 
 * 2. Target Configuration
 *    - Type: "Workflow"
 *    - Target: xperience2025_workflow
 *    - Data Format: "Json"
 *    - Purpose: Routes matched events to the main workflow
 *    - Execution: Triggers workflow with webhook data as input
 * 
 * 3. Event Topic
 *    - Topic: "v2.integrations.inbound.webhook.{id}.invocation"
 *    - Pattern: Standard Genesys Cloud webhook invocation topic
 *    - Scope: All webhook integrations in the organization
 *    - Filtering: Applied through match criteria to specific webhook
 * 
 * DEPENDENCIES:
 * 
 * The trigger depends on several resources being created first:
 * 
 * 1. Webhook Integration (genesyscloud_integration.xPerience2025_eventhook)
 *    - Must be created before trigger deployment
 *    - Provides the webhook ID used in match criteria
 *    - Enables webhook URL generation and configuration
 * 
 * 2. Workflow (genesyscloud_flow.xperience2025_workflow)
 *    - Must be deployed before trigger can reference it
 *    - Provides the target for trigger execution
 *    - Contains the business logic for ticket processing
 * 
 * 3. Webhook Data Source (data.genesyscloud_integration_webhook.xPerience2025_eventhook_info)
 *    - Provides the webhook ID for match criteria
 *    - May return null on first run due to timing dependencies
 *    - Requires webhook integration to be fully created
 * 
 * KNOWN ISSUE - WEBHOOK ID DEPENDENCY:
 * 
 * **Problem**: The process automation trigger may fail on first deployment because
 * the webhook ID can be null when the integration is first created. This is a
 * dependency timing issue where the trigger tries to use the webhook ID before
 * it's available from the API response.
 * 
 * **Symptoms**:
 * - Terraform apply fails with webhook ID validation errors
 * - Match criteria contains null or empty webhook ID
 * - Trigger cannot be created due to invalid configuration
 * 
 * **Root Cause**:
 * - Webhook integration creation and ID retrieval have timing dependencies
 * - API may not immediately return the webhook ID after integration creation
 * - Terraform tries to use the ID before it's available in the API response
 * 
 * **Workaround Solutions**:
 * 
 * 1. Two-Step Deployment:
 *    ```bash
 *    # Step 1: Deploy everything except the trigger
 *    terraform apply -target=genesyscloud_integration.xPerience2025_eventhook \
 *                    -target=module.xPerience2025_DataAction_Integration \
 *                    -target=genesyscloud_routing_queue.xperience2025_critical_queue \
 *                    -target=genesyscloud_routing_queue.xperience2025_high_queue \
 *                    -target=genesyscloud_routing_queue.xperience2025_medium_queue \
 *                    -target=genesyscloud_integration_action.Xperience2025-CreateCallback \
 *                    -target=genesyscloud_integration_action.Xperience2025_AgentlessSMS \
 *                    -target=genesyscloud_flow.xperience2025_workflow
 *    
 *    # Step 2: Deploy the trigger (webhook ID should now be available)
 *    terraform apply
 *    ```
 * 
 * 2. Multiple Apply Runs:
 *    ```bash
 *    # Run terraform apply multiple times until successful
 *    terraform apply  # May fail first time
 *    terraform apply  # Should succeed second time
 *    ```
 * 
 * **Prevention**:
 * - The depends_on attribute ensures proper resource creation order
 * - Webhook data source explicitly depends on integration creation
 * - Clear error messages help identify the timing issue
 * 
 * INTEGRATION FLOW:
 * 
 * 1. TicketFlow Application
 *    - Creates or updates ticket
 *    - Sends webhook payload to Genesys Cloud
 *    - Uses webhook URL from environment configuration
 * 
 * 2. Process Automation Trigger
 *    - Detects webhook invocation event
 *    - Matches event to specific webhook ID
 *    - Validates event data format and content
 * 
 * 3. Workflow Execution
 *    - Receives webhook data as input
 *    - Processes ticket information
 *    - Executes business logic for customer engagement
 * 
 * MONITORING AND DEBUGGING:
 * 
 * The trigger provides:
 * - Event matching logs for troubleshooting
 * - Execution status and performance metrics
 * - Error tracking for failed trigger attempts
 * - Integration status monitoring
 * 
 * SECURITY CONSIDERATIONS:
 * 
 * - Trigger only processes events from the specific webhook
 * - Webhook ID filtering prevents unauthorized event processing
 * - All communications use secure webhook URLs
 * - Access control through Genesys Cloud permissions
 * 
 * USAGE IN TICKETFLOW SYSTEM:
 * 
 * This trigger is the critical link that:
 * - Connects TicketFlow webhook events to Genesys Cloud automation
 * - Enables real-time ticket processing and customer engagement
 * - Provides the foundation for automated workflow execution
 * - Ensures seamless integration between TicketFlow and Genesys Cloud services
 */

resource "genesyscloud_processautomation_trigger" "XPerience2025_-Event_Hook_Trigger" {
  match_criteria = "[{\"jsonPath\":\"webhookId\",\"operator\":\"Equal\",\"value\":\"${data.genesyscloud_integration_webhook.xPerience2025_eventhook_info.web_hook_id}\"}]"
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
