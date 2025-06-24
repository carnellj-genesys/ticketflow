data "genesyscloud_user" "john_carnell" {
    name = "john.carnell@genesys.com"
}

data "genesyscloud_user" "richard_schott" {
    name = "richard.schott@genesys.com"
}

resource "genesyscloud_routing_wrapupcode" "xperience2025_customer_contacted" {
    name = "Contact Succesful"
    description = "Able to contact customer"
}

resource "genesyscloud_routing_wrapupcode" "xperience2025_customer_not_contacted" {
    name = "Contact Unsuccesful"
    description = "Unable to contact customer"
}

resource "genesyscloud_routing_queue" "xperience2025_critical_queue" {
    name = "xPerience2025_Critical_Queue"
    description = "For Xperience 2025.  Queue for critical tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }    

    wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}

resource "genesyscloud_routing_queue" "xperience2025_high_queue" {
    name = "xPerience2025_High_Queue"
    description = "For Xperience 2025.  Queue for high priority tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }   
     wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}

resource "genesyscloud_routing_queue" "xperience2025_medium_queue" {
    name = "xPerience2025_medium_Queue"
    description = "For Xperience 2025.  Queue for medium priority tickets"
    members {
       user_id= data.genesyscloud_user.john_carnell.id
    }      
     wrapup_codes = [genesyscloud_routing_wrapupcode.xperience2025_customer_contacted.id, genesyscloud_routing_wrapupcode.xperience2025_customer_not_contacted.id]
}