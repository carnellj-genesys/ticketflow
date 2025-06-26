/*
 * Genesys Cloud Workflow Configuration for TicketFlow
 * 
 * This file deploys the main workflow that orchestrates ticket processing in Genesys Cloud.
 * The workflow serves as the central automation engine that processes incoming ticket events
 * from TicketFlow and executes the appropriate business logic for customer engagement.
 * 
 * WORKFLOW RESOURCE:
 * 
 * 1. Main Workflow (genesyscloud_flow.xperience2025_workflow)
 *    - Type: Workflow (process automation workflow)
 *    - File: xperience2025_workflow.yaml
 *    - Content Hash: Automatically calculated for change detection
 *    - Purpose: Central business logic for ticket processing automation
 *    - State: Deployed and ready for webhook-triggered execution
 * 
 * WORKFLOW DEFINITION:
 * 
 * The workflow is defined in xperience2025_workflow.yaml and includes:
 * - Event processing logic for incoming webhook data
 * - Priority-based ticket routing to appropriate queues
 * - SMS notification capabilities using data actions
 * - Callback creation for customer contact
 * - Error handling and logging mechanisms
 * - Multi-channel communication orchestration
 * 
 * DEPENDENCIES:
 * 
 * The workflow depends on several resources being created first:
 * 
 * 1. Data Actions Integration Module (module.xPerience2025_DataAction_Integration)
 *    - Provides the foundation for API actions
 *    - Enables OAuth authentication for external API calls
 *    - Required for SMS and callback functionality
 * 
 * 2. Create Callback Data Action (genesyscloud_integration_action.Xperience2025-CreateCallback)
 *    - Enables automated callback creation
 *    - Used by workflow for customer contact scheduling
 *    - Provides queue-based callback routing
 * 
 * 3. Agentless SMS Data Action (genesyscloud_integration_action.Xperience2025_AgentlessSMS)
 *    - Enables automated SMS messaging
 *    - Used by workflow for customer notifications
 *    - Provides proactive communication capabilities
 * 
 * DEPLOYMENT STRATEGY:
 * 
 * - File-based deployment using YAML workflow definition
 * - Content hash ensures changes are detected and applied
 * - Dependencies ensure proper resource creation order
 * - Workflow is automatically enabled upon deployment
 * 
 * WORKFLOW FUNCTIONALITY:
 * 
 * The deployed workflow handles:
 * 
 * 1. Ticket Event Processing
 *    - Receives webhook data from TicketFlow application
 *    - Parses ticket information (priority, status, contact details)
 *    - Validates incoming data format and content
 * 
 * 2. Priority-Based Routing
 *    - Routes tickets to appropriate queues based on priority
 *    - Critical tickets → Critical queue
 *    - High tickets → High queue
 *    - Medium tickets → Medium queue
 *    - Low tickets → Medium queue (default)
 * 
 * 3. Customer Communication
 *    - Sends SMS notifications for ticket creation/updates
 *    - Creates callback requests for urgent tickets
 *    - Manages multi-channel customer engagement
 * 
 * 4. Error Handling
 *    - Logs processing errors and exceptions
 *    - Provides fallback mechanisms for failed operations
 *    - Ensures system resilience and reliability
 * 
 * INTEGRATION POINTS:
 * 
 * The workflow integrates with:
 * 
 * 1. TicketFlow Application
 *    - Receives webhook events via process automation trigger
 *    - Processes ticket data in real-time
 *    - Provides feedback through webhook responses
 * 
 * 2. Genesys Cloud Queues
 *    - Routes tickets to priority-based queues
 *    - Enables agent assignment and workload management
 *    - Supports SLA tracking and performance monitoring
 * 
 * 3. Data Actions
 *    - Executes SMS messaging for customer notifications
 *    - Creates callback requests for customer contact
 *    - Enables automated communication workflows
 * 
 * MONITORING AND DEBUGGING:
 * 
 * The workflow provides:
 * - Execution logs for troubleshooting
 * - Performance metrics and analytics
 * - Error tracking and alerting
 * - Integration status monitoring
 * 
 * SECURITY CONSIDERATIONS:
 * 
 * - Workflow uses OAuth authentication through data actions
 * - All API communications use HTTPS
 * - Input validation prevents malicious data processing
 * - Access control through Genesys Cloud permissions
 * 
 * USAGE IN TICKETFLOW SYSTEM:
 * 
 * This workflow is the core automation component that:
 * - Processes all incoming ticket events from TicketFlow
 * - Automates customer communication and engagement
 * - Ensures proper ticket routing and escalation
 * - Provides real-time ticket processing capabilities
 * - Enables seamless integration between TicketFlow and Genesys Cloud
 */

resource "genesyscloud_flow" "xperience2025_workflow" {
  filepath          = "xperience2025_workflow.yaml"
  file_content_hash = filesha256("xperience2025_workflow.yaml")
  type = "workflow"
  depends_on = [module.xPerience2025_DataAction_Integration, genesyscloud_integration_action.Xperience2025-CreateCallback, genesyscloud_integration_action.Xperience2025_AgentlessSMS]
}