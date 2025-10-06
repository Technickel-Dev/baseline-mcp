# Baseline MCP Server

## Inspiration

The inspiration for this project was to explore the interaction between Baseline and Model Context Protocol (MCP) while building a practical tool for web developers. I wanted to create a server that could provide accurate and up-to-date information about Baseline web features, empowering AI assistants to give better, more informed answers to developers' questions.

## An AI Wrangler's Perspective

As an "AI Wrangler", I'm a firm believer in an AI-assisted future. I know that the key to unlocking the full potential of AI is providing it with the right context. This project is a direct reflection of that philosophy. By creating an MCP server for Baseline web features, I'm providing a structured and reliable context that AI assistants can use to become more effective partners in the development process.

This isn't just a simple data wrapper on the Baseline data. It makes use of the unique opportunities that AI provides to put the Baseline data to use even before it gets into the hands of the LLM. Tools like `suggest-baseline-features` and `min-browser-support-report` are examples of how the server uses its own intelligence to process and analyze the data, providing more than just raw information. This pre-processing step is crucial for making the data more digestible and useful for the LLM, further enhancing its capabilities.

## What I Learned

This project was a huge learning experience. While an avid user of MCP, I had never built a server or a client myself, so that was a steep hill to climb. I dove deep into the `@modelcontextprotocol/sdk` and learned the ins and outs of creating a server that can communicate with MCP-compatible clients.

I also got to see how AI fits into the creative process. I used Google Veo, Imagen and Lyria to bring my video's vision to life, which was an eye-opening experience. It showed me how AI can be a powerful tool for creativity, not just for technical tasks.

## How I Built It

The project is built on a foundation of modern web technologies:

*   **Node.js and TypeScript:** The MCP server is a Node.js application written in TypeScript, providing a robust and powerful backend.
*   **@modelcontextprotocol/sdk:** This was the core library for building the MCP server.
*   **web-features:** This package from the Baseline project is the data source for all the web features information.
*   **SvelteKit:** The demo client is a modern web application built with SvelteKit.
*   **Netlify & Firebase:** The project is deployed on Netlify and Firebase, making it accessible to demo.

## Challenges I Faced

The biggest challenge was the learning curve of MCP. With no prior experience building an MCP server or client, I had to learn everything from the ground up. It was a difficult but ultimately rewarding process.

Another significant challenge was the client-server integration. Getting the client and server to communicate seamlessly, not just on my local machine but also over the internet, was a painful endeavor. There was a lot of debugging and head scratching involved, but seeing it all come together and work for others to enjoy made it all worthwhile.
