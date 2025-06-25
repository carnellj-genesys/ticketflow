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
