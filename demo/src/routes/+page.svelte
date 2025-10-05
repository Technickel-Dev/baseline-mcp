<script lang="ts">
  let prompt: string = "";
  let response: string = "";

  async function generateContent() {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    response = data.text;
  }
</script>

<main>
  <h1>Baseline MCP Demo</h1>
  <p>
    Ask things about Baseline! (ex. What has changed baseline status in the last 30 days?) This is REALLY rudementary MCP client, though it does work... but best results would be to use Gemini CLI or
    another MCP capable client
  </p>

  <label for="prompt">Prompt:</label>
  <textarea id="prompt" bind:value={prompt}></textarea>

  <button on:click={generateContent}>Generate Content</button>

  {#if response}
    <div>
      <h2>Response:</h2>
      <p>{response}</p>
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  label {
    display: block;
    margin-bottom: 5px;
  }

  input,
  textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    background-color: #4caf50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }
</style>
