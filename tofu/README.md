# TicketFlow Terraform Infrastructure Documentation

This Terraform configuration sets up a complete Genesys Cloud infrastructure for the **TicketFlow** application, specifically designed for the **Xperience 2025** conference demonstration. The infrastructure creates a webhook-based ticket processing system that integrates with Genesys Cloud to handle support tickets through automated workflows, queues, and communication channels.

## 🏗️ Infrastructure Overview

The TicketFlow Terraform infrastructure provides a complete Genesys Cloud integration that enables:

- **Real-time webhook communication** between TicketFlow and Genesys Cloud
- **Automated ticket processing** with priority-based routing
- **Multi-channel customer communication** (SMS, callbacks)
- **Agent workflow management** with queue assignments and wrap-up codes
- **OAuth-based API integration** for secure data actions
- **Process automation** with workflow orchestration

## 📁 File Structure

### Core Configuration Files

| File | Purpose | Description |
|------|---------|-------------|
| `provider.tf` | Provider Configuration | Sets up Genesys Cloud and HTTP providers with debug logging |
| `variables.tf` | Variable Definitions | Defines OAuth credentials and local variables |
| `integrations.tf` | Webhook Integration | Creates webhook integration, OAuth setup, and environment configuration |
| `queues.tf` | Routing Queues | Creates priority-based routing queues with user assignments |
| `dataactions.tf` | Data Actions | Defines API integration actions for SMS and callbacks |
| `flows.tf` | Workflow | Deploys the main workflow for ticket processing automation |
| `process_automation_trigger.tf` | Trigger | Sets up webhook trigger for workflow execution |

### Supporting Files

| File | Purpose | Description |
|------|---------|-------------|
| `xperience2025_workflow.yaml` | Workflow Definition | YAML file containing the main workflow logic |
| `.terraform.lock.hcl` | Dependency Lock | Terraform dependency lock file |
| `terraform.tfstate` | State File | Current Terraform state (do not edit manually) |

## 🔧 Components Breakdown

### 1. **Provider Configuration** (`provider.tf`)

**Purpose**: Establishes connection to Genesys Cloud platform and enables HTTP requests for OAuth authentication.

**Key Features**:
- Genesys Cloud provider with SDK debugging enabled
- HTTP provider for OAuth token requests and external API calls
- Version-locked dependencies for stability
- Debug logging for troubleshooting API interactions

**Dependencies**: Requires OAuth client credentials from environment variables

### 2. **Variable Definitions** (`variables.tf`)

**Purpose**: Defines input variables for OAuth authentication and provides local variable mappings.

**Variables Defined**:
- `GENESYSCLOUD_OAUTHCLIENT_ID`: OAuth client ID for API authentication
- `GENESYSCLOUD_OAUTHCLIENT_SECRET`: OAuth client secret for API authentication

**Validation**: Environment variables are validated using Terraform checks in `integrations.tf`

### 3. **Webhook Integration** (`integrations.tf`)

**Purpose**: Sets up the core integrations between TicketFlow and Genesys Cloud.

**Resources Created**:

#### **Main Webhook Integration**
- **Resource**: `genesyscloud_integration.xPerience2025_eventhook`
- **Type**: Webhook integration for receiving events
- **Rate Limit**: 200 invocations per minute
- **Purpose**: Receives ticket data from TicketFlow application
- **State**: Enabled and ready for webhook invocations

#### **Data Actions Integration Module**
- **Module**: `xPerience2025_DataAction_Integration`
- **Source**: Genesys Cloud DevOps public module (v1.0.0)
- **Purpose**: Enables custom API actions within Genesys Cloud
- **Authentication**: Uses OAuth client credentials

#### **Environment Configuration**
- **Resource**: `local_file.environment_override`
- **File**: `.env.development` in TicketFlow project root
- **Purpose**: Automatically configures TicketFlow with webhook endpoint
- **Updates**: Overwrites file on each deployment

#### **Validation**
- **Check**: `required_env_vars`
- **Purpose**: Validates OAuth credentials before deployment
- **Error Handling**: Fails deployment with clear error message if credentials missing

### 4. **Routing Queues** (`queues.tf`)

**Purpose**: Creates priority-based routing queues with user assignments and wrap-up codes.

**Resources Created**:

#### **User References**
- `john.carnell@genesys.com`: Primary agent for ticket handling
- `richard.schott@genesys.com`: Secondary agent for ticket handling

#### **Wrap-up Codes**
- "Contact Successful": Used when agents successfully reach customers
- "Contact Unsuccessful": Used when agents cannot reach customers

#### **Priority-Based Queues**

| Queue | Priority | Members | Purpose | SLA |
|-------|----------|---------|---------|-----|
| `xPerience2025_Critical_Queue-TF` | Critical | john.carnell@genesys.com | Urgent tickets requiring immediate attention | Highest priority |
| `xPerience2025_High_Queue-TF` | High | john.carnell@genesys.com | High-priority tickets with elevated urgency | High priority |
| `xPerience2025_medium_Queue-TF` | Medium | john.carnell@genesys.com | Standard priority tickets | Normal priority |

### 5. **Data Actions** (`dataactions.tf`)

**Purpose**: Defines Genesys Cloud integration actions for automated customer communication.

**Actions Created**:

#### **Create Callback Action**
- **Name**: `Xperience2025-CreateCallback-TF`
- **API**: `POST /api/v2/conversations/callbacks`
- **Purpose**: Creates callback requests for customer contact
- **Input**: `callbackNumber`, `queueId`
- **Output**: Raw API response from Genesys Cloud

#### **Agentless SMS Action**
- **Name**: `Xperience2025_AgentlessSMS-TF`
- **API**: `POST /api/v2/conversations/messages/agentless`
- **Purpose**: Sends SMS messages without agent intervention
- **Input**: `BODY`, `FromMOBILE`, `MOBILE`
- **Output**: Comprehensive message response with conversation details

### 6. **Workflow** (`flows.tf`)

**Purpose**: Deploys the main workflow that orchestrates ticket processing automation.

**Resource**: `genesyscloud_flow.xperience2025_workflow`
- **Type**: Workflow (process automation workflow)
- **File**: `xperience2025_workflow.yaml`
- **Content Hash**: Automatically calculated for change detection
- **Dependencies**: Data actions integration module and data actions

**Functionality**:
- Event processing for incoming webhook data
- Priority-based ticket routing to appropriate queues
- SMS notification capabilities using data actions
- Callback creation for customer contact
- Error handling and logging mechanisms

### 7. **Process Automation Trigger** (`process_automation_trigger.tf`)

**Purpose**: Creates the trigger that starts the workflow when webhook events occur.

**Resource**: `genesyscloud_processautomation_trigger.XPerience2025_-Event_Hook_Trigger`
- **Topic**: `v2.integrations.inbound.webhook.{id}.invocation`
- **Match Criteria**: Filters events by webhook ID
- **Target**: Routes matched events to the main workflow
- **Data Format**: JSON

## ⚠️ Known Issues

### **Webhook ID Dependency Issue**

**Problem**: The process automation trigger may fail on first deployment because the webhook ID can be null when the integration is first created. This is a dependency timing issue where the trigger tries to use the webhook ID before it's available from the API response.

**Symptoms**:
- Terraform apply fails with webhook ID validation errors
- Match criteria contains null or empty webhook ID
- Trigger cannot be created due to invalid configuration

**Root Cause**:
- Webhook integration creation and ID retrieval have timing dependencies
- API may not immediately return the webhook ID after integration creation
- Terraform tries to use the ID before it's available in the API response

## 🔄 **System Flow**

1. **Ticket Creation**: User creates ticket in TicketFlow application
2. **Webhook Trigger**: TicketFlow sends data to Genesys Cloud webhook
3. **Process Automation**: Trigger detects webhook invocation
4. **Workflow Execution**: Main workflow processes the ticket
5. **Priority Routing**: Ticket routed to appropriate priority queue
6. **Communication**: SMS/callback actions executed based on workflow logic
7. **Status Update**: Ticket status updated in TicketFlow

## 🚀 **Deployment**

### Prerequisites

```bash
# Set environment variables
export TF_VAR_GENESYSCLOUD_OAUTHCLIENT_ID="your_client_id"
export TF_VAR_GENESYSCLOUD_OAUTHCLIENT_SECRET="your_client_secret"
```

### Standard Deployment

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply

# Destroy infrastructure (when needed)
terraform destroy
```

### **Workaround for Webhook ID Issue**

If you encounter the webhook ID error, use one of these approaches:

#### **Option 1: Two-Step Deployment**
```bash
# Step 1: Deploy everything except the trigger
terraform apply -target=genesyscloud_integration.xPerience2025_eventhook \
                -target=module.xPerience2025_DataAction_Integration \
                -target=genesyscloud_routing_queue.xperience2025_critical_queue \
                -target=genesyscloud_routing_queue.xperience2025_high_queue \
                -target=genesyscloud_routing_queue.xperience2025_medium_queue \
                -target=genesyscloud_integration_action.Xperience2025-CreateCallback \
                -target=genesyscloud_integration_action.Xperience2025_AgentlessSMS \
                -target=genesyscloud_flow.xperience2025_workflow

# Step 2: Deploy the trigger (webhook ID should now be available)
terraform apply
```

#### **Option 2: Multiple Apply Runs**
```bash
# Run terraform apply multiple times until successful
terraform apply  # May fail first time
terraform apply  # Should succeed second time
```

## 📊 **Outputs and Configuration**

### **Environment Configuration**
The deployment automatically updates the TicketFlow application's environment file:
- **File**: `.env.development`
- **Content**: `VITE_WEBHOOK_URL=${webhook_url}`
- **Purpose**: Configures TicketFlow with the generated webhook URL

### **Generated Resources**
- Webhook integration with unique URL
- Priority-based routing queues
- Data actions for SMS and callbacks
- Process automation workflow
- Event trigger for webhook processing

## 🔐 **Security**

- **OAuth Authentication**: All API communications use OAuth client credentials
- **Environment Variables**: Sensitive credentials stored as environment variables
- **Webhook Security**: URLs automatically generated and secured
- **Access Control**: Queues restricted to assigned users only
- **HTTPS**: All communications use secure protocols
- **Debug Logging**: Enabled for development and troubleshooting

## 🎯 **Use Case**

This infrastructure is designed for **Xperience 2025 conference demonstration**, showcasing:

- **Modern Web Application Integration**: How React applications integrate with Genesys Cloud
- **Automated Ticket Processing**: End-to-end workflow automation
- **Priority-Based Routing**: Intelligent ticket escalation and handling
- **Multi-Channel Communication**: SMS and callback capabilities
- **Real-Time Integration**: Webhook-based event processing
- **Agent Workflow Management**: Queue assignments and wrap-up codes

## 📝 **Notes**

- **Resource Naming**: All resources use `-TF` suffix for Terraform management
- **Environment Updates**: The system automatically updates the TicketFlow application's environment file
- **Debug Logging**: SDK debugging is enabled for development purposes
- **Demonstration Focus**: Infrastructure designed for demonstration and can be easily destroyed/recreated
- **Timing Dependencies**: Process automation trigger may fail on first run due to webhook ID dependency timing

## 🔧 **Troubleshooting**

### **Common Issues**

1. **OAuth Credentials Missing**
   - Ensure environment variables are set correctly
   - Check that credentials have proper permissions in Genesys Cloud

2. **Webhook ID Dependency Error**
   - Use the two-step deployment approach
   - Run multiple `terraform apply` commands

3. **Workflow Deployment Failures**
   - Verify YAML syntax in `xperience2025_workflow.yaml`
   - Check that all data actions are created before workflow deployment

4. **Queue Assignment Issues**
   - Ensure referenced users exist in Genesys Cloud
   - Verify user permissions and availability

### **Debug Information**

- SDK debug logs are written to `sdk_debug.log`
- Terraform state information in `terraform.tfstate`
- Webhook URL automatically configured in `.env.development`
- All resources tagged with `-TF` suffix for identification

## 📚 **Additional Resources**

- [Genesys Cloud API Documentation](https://developer.genesys.cloud/)
- [Terraform Genesys Cloud Provider](https://registry.terraform.io/providers/mypurecloud/genesyscloud/latest/docs)
- [Process Automation Documentation](https://developer.genesys.cloud/platform/api/process-automation/)
- [Data Actions Integration Module](https://github.com/GenesysCloudDevOps/public-api-data-actions-integration-module) 