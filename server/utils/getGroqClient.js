// groqClient.js (or inside your controller)

let GroqClient;

async function getGroqClient() {
  if (!GroqClient) {
    const module = await import("groq-sdk");
    GroqClient = module.default;
  }
  return new GroqClient({
    apiKey: process.env.GROQ_API_KEY
  });
}

module.exports = { getGroqClient };