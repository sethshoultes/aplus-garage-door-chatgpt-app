import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkServiceAreaTool } from '../src/tools/check-service-area';
import { diagnoseIssueTool } from '../src/tools/diagnose-issue';
import { createServiceRequestTool } from '../src/tools/create-service-request';
import { getPromotionsTool } from '../src/tools/get-promotions';
import { getAvailabilityTool } from '../src/tools/get-availability';
import { getDoorStylesTool } from '../src/tools/get-door-styles';

const tools = [
  checkServiceAreaTool,
  diagnoseIssueTool,
  createServiceRequestTool,
  getPromotionsTool,
  getAvailabilityTool,
  getDoorStylesTool,
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { tool: toolName, params } = req.body;

    if (!toolName) {
      res.status(400).json({ error: 'Missing tool name' });
      return;
    }

    const tool = tools.find((t) => t.name === toolName);

    if (!tool) {
      res.status(404).json({ error: `Tool '${toolName}' not found` });
      return;
    }

    const result = await tool.handler(params);
    res.status(200).json(result.structuredContent);
  } catch (error: any) {
    console.error('Tool execution error:', error);
    res.status(500).json({
      error: 'Tool execution failed',
      message: error.message,
    });
  }
}
