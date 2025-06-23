You are a senior TypeScript React developer tasked with building a comprehensive ticketing system application. 

First read the current specification for the system contained in the prompts/app_prompt.md file. Then read the source code for this application in the src dir.

You have been tasked to take the ticketing application that has been built and add the ability to call a webhook every time a ticket is created, updated or deleted. This webhook should be invoked asynchronously so as to not hold up the current application while the webhook is invoked. If there are any problems with the webhook, the error should be displayed in a red banner on the main landing page.

## Webhook Configuration

The webhook should be configurable via:
- **Default URL**: `https://api.example.com/webhook/tickets`
- **Environment Variable**: `REACT_APP_WEBHOOK_URL` (overrides default)
- **Enable/Disable**: `REACT_APP_WEBHOOK_ENABLED` (default: `false`, must be set to `true` to enable)

## Implementation Requirements

1. **Webhook Service**: Create a dedicated webhook service in `src/services/webhookService.ts`
2. **Error Handling**: Display webhook errors in the existing ErrorBanner component
3. **Async Execution**: Use `setTimeout` or similar to ensure webhook calls don't block the UI
4. **Integration Points**: Hook into the existing ticket service methods (create, update, delete)

## Webhook Payload

When the webhook is invoked, it should send a POST request with the following JSON body:

```json
{
  "id": "string",
  "action": "CREATE" | "UPDATE" | "DELETE",
  "issue_title": "string",
  "issue_description": "string", 
  "status": "Open" | "In-progress" | "Closed",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "email": "string",
  "created": "string",
  "changed": "string"
}
```

The `action` field indicates the type of operation performed: `CREATE` for new tickets, `UPDATE` for modified tickets, or `DELETE` for removed tickets.

## Error Handling

- Webhook failures should not prevent the main ticket operation from completing
- Failed webhook attempts should be logged to console
- If webhook is disabled via environment variable, no calls should be made
- Network timeouts should be handled gracefully (5 second timeout recommended)

After you have generated all code, please update the prompts/app_prompt.md with the specification of this webhook functionality and update the README.md with webhook configuration instructions.