import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    tools: [
      "check_service_area",
      "diagnose_issue",
      "create_service_request"
    ],
    mcp_endpoint: "/api/mcp",
    timestamp: new Date().toISOString()
  });
}
