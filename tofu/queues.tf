/*
 * Genesys Cloud Routing Queues and User Configuration for TicketFlow
 * 
 * This file sets up the routing infrastructure for handling tickets in Genesys Cloud:
 * 
 * 1. User Data Sources:
 *    - References existing Genesys Cloud users (john.carnell@genesys.com, richard.schott@genesys.com)
 *    - These users will be assigned to handle tickets in the routing queues
 * 
 * 2. Wrap-up Codes:
 *    - "Contact Successful": Used when agents successfully contact customers
 *    - "Contact Unsuccessful": Used when agents are unable to reach customers
 *    - These codes help track the outcome of customer interactions
 * 
 * 3. Priority-Based Routing Queues:
 *    - Critical Queue: For urgent tickets requiring immediate attention
 *    - High Queue: For high-priority tickets
 *    - Medium Queue: For medium-priority tickets
 *    - Each queue is assigned to specific users and includes wrap-up codes
 * 
 * These queues are used by the workflow defined in flows.tf to route tickets
 * based on their priority level, ensuring appropriate handling and escalation.
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