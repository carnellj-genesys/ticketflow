/*
 * Genesys Cloud Routing Queues and User Configuration for TicketFlow
 * 
 * This file sets up the routing infrastructure for handling tickets in Genesys Cloud,
 * creating priority-based queues with appropriate user assignments and wrap-up codes.
 * The queues enable automated ticket routing based on priority levels and provide
 * the foundation for agent workflow management.
 * 
 * DATA SOURCES:
 * 
 * 1. User References (data.genesyscloud_user)
 *    - john.carnell@genesys.com: Primary agent for ticket handling
 *    - richard.schott@genesys.com: Secondary agent for ticket handling
 *    - Purpose: References existing Genesys Cloud users for queue assignment
 *    - Usage: These users will receive and handle tickets in the routing queues
 * 
 * WRAP-UP CODES:
 * 
 * 1. Contact Successful (genesyscloud_routing_wrapupcode.xperience2025_customer_contacted)
 *    - Name: "Contact Successful"
 *    - Description: "Able to contact customer"
 *    - Purpose: Used when agents successfully reach customers
 *    - Usage: Applied after successful customer interactions
 * 
 * 2. Contact Unsuccessful (genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted)
 *    - Name: "Contact Unsuccessful"
 *    - Description: "Unable to contact customer"
 *    - Purpose: Used when agents cannot reach customers
 *    - Usage: Applied after failed contact attempts
 * 
 * ROUTING QUEUES:
 * 
 * 1. Critical Priority Queue (genesyscloud_routing_queue.xperience2025_critical_queue)
 *    - Name: "xPerience2025_Critical_Queue-TF"
 *    - Description: "For Xperience 2025. Queue for critical tickets"
 *    - Members: john.carnell@genesys.com
 *    - Wrap-up Codes: Contact Successful, Contact Unsuccessful
 *    - Purpose: Handles urgent tickets requiring immediate attention
 *    - SLA: Highest priority with fastest response time
 * 
 * 2. High Priority Queue (genesyscloud_routing_queue.xperience2025_high_queue)
 *    - Name: "xPerience2025_High_Queue-TF"
 *    - Description: "For Xperience 2025. Queue for high priority tickets"
 *    - Members: john.carnell@genesys.com
 *    - Wrap-up Codes: Contact Successful, Contact Unsuccessful
 *    - Purpose: Handles high-priority tickets with elevated urgency
 *    - SLA: High priority with quick response time
 * 
 * 3. Medium Priority Queue (genesyscloud_routing_queue.xperience2025_medium_queue)
 *    - Name: "xPerience2025_medium_Queue-TF"
 *    - Description: "For Xperience 2025. Queue for medium priority tickets"
 *    - Members: john.carnell@genesys.com
 *    - Wrap-up Codes: Contact Successful, Contact Unsuccessful
 *    - Purpose: Handles standard priority tickets
 *    - SLA: Normal priority with standard response time
 * 
 * QUEUE CONFIGURATION DETAILS:
 * 
 * - All queues use the "-TF" suffix for Terraform management
 * - Each queue includes both wrap-up codes for comprehensive tracking
 * - User assignments enable direct ticket routing to agents
 * - Descriptions clearly identify the purpose and scope
 * - Queues are designed for the Xperience 2025 conference demonstration
 * 
 * WORKFLOW INTEGRATION:
 * 
 * These queues are used by the workflow defined in flows.tf to:
 * - Route tickets based on priority levels (Critical, High, Medium)
 * - Assign tickets to appropriate agents for handling
 * - Enable proper escalation and SLA management
 * - Provide tracking capabilities through wrap-up codes
 * 
 * PRIORITY ROUTING LOGIC:
 * 
 * The workflow uses these queues to implement priority-based routing:
 * - Critical tickets → xPerience2025_Critical_Queue-TF
 * - High tickets → xPerience2025_High_Queue-TF
 * - Medium tickets → xPerience2025_medium_Queue-TF
 * - Low tickets → May be handled differently or routed to medium queue
 * 
 * AGENT WORKFLOW:
 * 
 * Agents assigned to these queues can:
 * - Receive tickets automatically based on priority
 * - Use wrap-up codes to track interaction outcomes
 * - Escalate tickets between queues if needed
 * - Provide consistent customer service across priority levels
 * 
 * MONITORING AND REPORTING:
 * 
 * The queue structure enables:
 * - Priority-based performance metrics
 * - Agent productivity tracking
 * - SLA compliance monitoring
 * - Customer contact success rate analysis
 * - Queue utilization reporting
 * 
 * SECURITY AND ACCESS:
 * - Queues are restricted to assigned users only
 * - Wrap-up codes provide audit trail for interactions
 * - Queue names clearly identify Terraform-managed resources
 * - Access control through Genesys Cloud user management
 */

data "genesyscloud_user" "john_carnell" {
    name = "john.carnell@genesys.com"
}

data "genesyscloud_user" "richard_schott" {
    name = "richard.schott@genesys.com"
}

resource "genesyscloud_routing_wrapupcode" "xperience2025_customer_contacted" {
    name = "Contact Successful"
    description = "Able to contact customer"
}

resource "genesyscloud_routing_wrapupcode" "xperience2025_customer_not_contacted" {
    name = "Contact Unsuccessful"
    description = "Unable to contact customer"
}

resource "genesyscloud_routing_queue" "xperience2025_critical_queue" {
    name = "xPerience2025_Critical_Queue-TF"
    description = "For Xperience 2025.  Queue for critical tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }    

    wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}

resource "genesyscloud_routing_queue" "xperience2025_high_queue" {
    name = "xPerience2025_High_Queue-TF"
    description = "For Xperience 2025.  Queue for high priority tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }   
     wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}

resource "genesyscloud_routing_queue" "xperience2025_medium_queue" {
    name = "xPerience2025_medium_Queue-TF"
    description = "For Xperience 2025.  Queue for medium priority tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }      
     wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}