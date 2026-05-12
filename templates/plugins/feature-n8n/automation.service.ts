export const automationService = {
  /**
   * Securely dispatches workflow payloads to an external n8n Webhook trigger node.
   */
  async dispatchWorkflow(workflowName: string, payload: Record<string, any>): Promise<void> {
    const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
    const secret = process.env.N8N_SHARED_SECRET;

    if (!baseUrl || !secret) {
      console.warn('⚠️ Automation skipped: N8N configurations are missing.');
      return;
    }

    try {
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/webhook/${workflowName}`;
      
      // Execute non-blocking network dispatch
      fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Automation-Secret': secret,
        },
        body: JSON.stringify({ timestamp: new Date().toISOString(), data: payload }),
      }).catch((err) => console.error(`🚨 Background n8n dispatch failed for [${workflowName}]:`, err));
      
    } catch (error) {
      console.error('🚨 Failed to compile automation webhook parameters.');
    }
  },
};