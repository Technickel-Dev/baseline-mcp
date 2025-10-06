import { GOOGLE_API_KEY } from "$env/static/private";
import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function POST({ request }) {
  const scriptPath = path.resolve(__dirname, "../../../lib/mcp/server.js");

  const transport = new StdioClientTransport({
    command: "node",
    args: [scriptPath],
  });

  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });
  const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

  const { prompt } = await request.json();

  try {
    await client.connect(transport);
  } catch (error) {
    console.log(error);
  }

  const content = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [mcpToTool(client)],
    },
  });

  await client.close();

  return new Response(JSON.stringify({ text: content.text }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
