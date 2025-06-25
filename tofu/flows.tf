/*
 * Genesys Cloud Workflow Configuration for TicketFlow
 * 
 * This file deploys the main workflow that orchestrates ticket processing in Genesys Cloud:
 * 
 * 1. Workflow Deployment:
 *    - Deploys the workflow defined in xperience2025_workflow.yaml
 *    - Uses file content hash for change detection
 *    - Type: workflow (process automation workflow)
 * 
 * 2. Dependencies:
 *    - Depends on the data actions integration module
 *    - Requires the CreateCallback data action to be available
 *    - Requires the AgentlessSMS data action to be available
 * 
 * The workflow (defined in the YAML file) handles the business logic for:
 * - Processing incoming ticket events from TicketFlow
 * - Routing tickets to appropriate queues based on priority
 * - Sending SMS notifications to customers
 * - Creating callback requests when needed
 * 
 * This is the core automation component that connects TicketFlow with Genesys Cloud services.
 */

resource "genesyscloud_flow" "xperience2025_workflow" {
  filepath          = "xperience2025_workflow.yaml"
  file_content_hash = filesha256("xperience2025_workflow.yaml")
  type = "workflow"
  depends_on = [module.xPerience2025_DataAction_Integration, genesyscloud_integration_action.Xperience2025-CreateCallback, genesyscloud_integration_action.Xperience2025_AgentlessSMS]
}