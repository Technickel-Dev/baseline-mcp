import { GOOGLE_API_KEY } from "$env/static/private";
import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@technickel/baseline-mcp"],
});

export async function POST({ request }) {
  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });
  const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

  const { prompt } = await request.json();

  await client.connect(transport);

  let text = "";
  try {
    const content = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [mcpToTool(client)],
      },
    });

    text = content.text || "";
  } catch (error) {
    console.log(error);
  }

  try {
    await client.close();
  } catch (error) {
    console.log(error);
  }

  return new Response(JSON.stringify({ text: text }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
