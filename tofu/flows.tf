resource "genesyscloud_flow" "xperience2025_workflow" {
  filepath          = "xperience2025_workflow.yaml"
  file_content_hash = filesha256("xperience2025_workflow.yaml")
  type = "workflow"
  depends_on = [module.xPerience2025_DataAction_Integration, genesyscloud_integration_action.Xperience2025-CreateCallback, genesyscloud_integration_action.Xperience2025_AgentlessSMS]
}