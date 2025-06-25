# Terraform Infrastructure Documentation

This Terraform configuration sets up a complete Genesys Cloud infrastructure for the **TicketFlow** application, specifically designed for the **Xperience 2025** conference demonstration.

## 🏗️ Infrastructure Overview

This Terraform setup creates a **webhook-based ticket processing system** that integrates with Genesys Cloud to handle support tickets through automated workflows, queues, and communication channels.

## ⚠️ Known Issues

**Webhook ID Dependency Issue**: The process automation trigger may fail on first run because `local.webhook_id` can be `null` when the integration is first created. This is a dependency timing issue where the trigger tries to use the webhook ID before it's available from the API response.

## 📁 File Structure

### Core Configuration Files

| File | Purpose | Description |
|------|---------|-------------|
| `provider.tf` | Provider Configuration | Sets up Genesys Cloud and HTTP providers |
| `variables.tf` | Variable Definitions | Defines input variables (currently empty) |
| `integrations.tf` | Webhook Integration | Creates webhook integration and OAuth setup |
| `queues.tf` | Routing Queues | Creates priority-based routing queues |
| `dataactions.tf` | Data Actions | Defines API integration actions |
| `flows.tf` | Workflow | Deploys the main workflow |
| `process_automation_trigger.tf` | Trigger | Sets up webhook trigger for workflow |

## 🔧 Components Breakdown

### 1. **Provider Configuration** (`provider.tf`)
```hcl
# Configures Genesys Cloud provider with debug logging
# Sets up HTTP provider for OAuth token requests
```

**Purpose**: Establishes connection to Genesys Cloud platform and enables HTTP requests for OAuth authentication.

### 2. **Webhook Integration** (`integrations.tf`)

#### **Main Webhook Integration**
- **Resource**: `genesyscloud_integration.xPerience2025_eventhook`
- **Type**: Webhook integration
- **Rate Limit**: 200 invocations per minute
- **Purpose**: Receives ticket data from TicketFlow application

#### **OAuth Authentication**
- **Data Source**: `http.oauth_token`
- **Endpoint**: `https://login.usw2.pure.cloud/oauth/token`
- **Method**: Client credentials flow
- **Purpose**: Authenticates API requests to Genesys Cloud

#### **Data Action Integration Module**
- **Module**: `xPerience2025_DataAction_Integration`
- **Source**: Genesys Cloud DevOps public module
- **Purpose**: Enables custom API actions within Genesys Cloud

#### **Environment Override**
- **Resource**: `local_file.environment_override`
- **File**: `.env.development`
- **Purpose**: Automatically updates the TicketFlow application with the generated webhook URL

#### **Webhook ID Extraction**
- **Data Source**: `http.integration`
- **Purpose**: Fetches integration details to extract webhook ID and URL
- **Issue**: May return `null` on first run due to timing

### 3. **Routing Queues** (`queues.tf`)

Creates three priority-based queues for ticket routing:

| Queue | Priority | Members | Wrap-up Codes |
|-------|----------|---------|---------------|
| `xPerience2025_Critical_Queue-TF` | Critical | john.carnell@genesys.com | Contact Successful/Unsuccessful |
| `xPerience2025_High_Queue-TF` | High | john.carnell@genesys.com | Contact Successful/Unsuccessful |
| `xPerience2025_medium_Queue-TF` | Medium | john.carnell@genesys.com | Contact Successful/Unsuccessful |

**Wrap-up Codes**:
- "Contact Successful" - Customer was reached
- "Contact Unsuccessful" - Customer could not be reached

### 4. **Data Actions** (`dataactions.tf`)

#### **Create Callback Action**
- **Name**: `Xperience2025-CreateCallback-TF`
- **Purpose**: Creates callback requests in Genesys Cloud
- **Input**: `callbackNumber`, `queueId`
- **API**: `POST /api/v2/conversations/callbacks`

#### **Agentless SMS Action**
- **Name**: `Xperience2025_AgentlessSMS-TF`
- **Purpose**: Sends SMS messages without agent intervention
- **Input**: `BODY`, `FromMOBILE`, `MOBILE`
- **API**: `POST /api/v2/conversations/messages/agentless`

### 5. **Workflow** (`flows.tf`)
- **Resource**: `genesyscloud_flow.xperience2025_workflow`
- **File**: `xperience2025_workflow.yaml`
- **Type**: Workflow
- **Purpose**: Main business logic for processing tickets

### 6. **Process Automation Trigger** (`process_automation_trigger.tf`)
- **Resource**: `genesyscloud_processautomation_trigger.XPerience2025_-Event_Hook_Trigger`
- **Topic**: `v2.integrations.inbound.webhook.{id}.invocation`
- **Trigger**: Webhook invocation
- **Target**: Xperience2025 workflow
- **Purpose**: Automatically starts workflow when webhook receives data
- **Issue**: Uses `local.webhook_id` which may be `null` on first run

## 🔄 **System Flow**

1. **Ticket Creation**: User creates ticket in TicketFlow application
2. **Webhook Trigger**: TicketFlow sends data to Genesys Cloud webhook
3. **Process Automation**: Trigger detects webhook invocation
4. **Workflow Execution**: Main workflow processes the ticket
5. **Queue Assignment**: Ticket routed to appropriate priority queue
6. **Communication**: SMS/callback actions executed based on workflow logic
7. **Status Update**: Ticket status updated in TicketFlow

## 🚀 **Deployment**

### Prerequisites
```bash
# Set environment variables
export TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID="your_client_id"
export TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET="your_client_secret"
```

### Commands
```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply

# Destroy infrastructure
terraform destroy
```

### **Workaround for Webhook ID Issue**

If you encounter the webhook ID error, run the deployment in two steps:

```bash
# Step 1: Deploy everything except the trigger
terraform apply -target=genesyscloud_integration.xPerience2025_eventhook -target=module.xPerience2025_DataAction_Integration -target=genesyscloud_routing_queue.xperience2025_critical_queue -target=genesyscloud_routing_queue.xperience2025_high_queue -target=genesyscloud_routing_queue.xperience2025_medium_queue -target=genesyscloud_integration_action.Xperience2025-CreateCallback -target=genesyscloud_integration_action.Xperience2025_AgentlessSMS -target=genesyscloud_flow.xperience2025_workflow

OR 

just run the scriot twice

# Step 2: Deploy the trigger (webhook ID should now be available)
terraform apply
```

## 📊 **Outputs**

| Output | Description | Sensitive |
|--------|-------------|-----------|
| `oauthclient_id` | Genesys Cloud OAuth Client ID | No |
| `oauthclient_secret` | Genesys Cloud OAuth Client Secret | Yes |
| `webhook_url` | Generated webhook URL for TicketFlow | No |

## 🔐 **Security**

- OAuth client credentials stored as sensitive variables
- Webhook URLs automatically generated and secured
- All API communications use HTTPS
- Debug logging enabled for troubleshooting

## 🎯 **Use Case**

This infrastructure is designed for **Xperience 2025 conference demonstration**, showing how:
- Modern web applications can integrate with Genesys Cloud
- Automated ticket processing workflows
- Priority-based routing and escalation
- Multi-channel communication (SMS, callbacks)
- Real-time webhook-based integrations

## 📝 **Notes**

- All resources are tagged with `-TF` suffix for Terraform management
- The system automatically updates the TicketFlow application's environment file
- Debug logging is enabled for development purposes
- The infrastructure is designed for demonstration and can be easily destroyed/recreated
- **Known Issue**: Process automation trigger may fail on first run due to webhook ID dependency timing 