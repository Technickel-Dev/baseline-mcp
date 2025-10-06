<script lang="ts">
  let prompt: string = "";
  let response: string = "";
  let loading: boolean = false;

  async function generateContent() {
    loading = true;
    response = "";
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    response = data.text;
    loading = false;
  }
</script>

<div class="container">
  <main>
    <div class="card">
      <h1>Baseline MCP Demo</h1>
      <p>
        Ask things about Baseline! (ex. What has changed baseline status in the last 30 days?) This is a rudimentary MCP client, but it works. For best results, use Gemini CLI or another MCP-capable client.
      </p>
    </div>

    <div class="card">
      <label for="prompt">Your Prompt:</label>
      <textarea id="prompt" bind:value={prompt} placeholder="e.g., What are the latest browser versions?"></textarea>
      <button on:click={generateContent} disabled={loading}>
        {#if loading}
          <span>Generating...</span>
        {:else}
          <span>Generate Content</span>
        {/if}
      </button>
    </div>

    {#if loading}
      <div class="card loading">
        <div class="spinner"></div>
        <p>Loading... Hold your horses, this may take a little</p>
      </div>
    {/if}

    {#if response}
      <div class="card response">
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
    {/if}
  </main>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

  :global(body) {
    font-family: 'Roboto', sans-serif;
    background-color: #f0f2f5;
    color: #333;
    margin: 0;
  }

  .container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  main {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #1a73e8;
  }

  p {
    line-height: 1.6;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    min-height: 100px;
    box-sizing: border-box;
  }

  button {
    background-color: #1a73e8;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    background-color: #155ab6;
  }

  button:disabled {
    background-color: #a0c3ff;
    cursor: not-allowed;
  }

  .response {
    background-color: #e8f0fe;
    border-left: 4px solid #1a73e8;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border-left-color: #1a73e8;
    animation: spin 1s ease infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>