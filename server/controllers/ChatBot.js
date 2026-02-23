// import Groq from "groq-sdk";
// import dotenv from "dotenv";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// const { buildKnowledgeBase, getSystemPrompt } = require("../utils/knowledgeBase.js");

// dotenv.config();

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// export const chatbotController = async (req, res) => {
//   try {
//     const message = req.body?.message ?? req.body?.query;

//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing message or query in request body",
//       });
//     }

//     if (!process.env.GROQ_API_KEY) {
//       return res.status(500).json({
//         success: false,
//         message: "GROQ_API_KEY is not set in server .env. Get a free key at https://console.groq.com",
//       });
//     }

//     const knowledge = await buildKnowledgeBase();
//     const systemPrompt = getSystemPrompt(knowledge);

//     const completion = await groq.chat.completions.create({
//       model: MODEL,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: message },
//       ],
//       max_tokens: 1024,
//     });

//     const reply =
//       completion.choices?.[0]?.message?.content?.trim() || "No response from the model.";

//     res.json({ success: true, reply });
//   } catch (error) {
//     console.error("Groq API error:", error.response?.data || error.message);

//     const errData = error.response?.data?.error || error.error;
//     const status = error.response?.status || error.status;
//     const msg =
//       errData?.message ||
//       error.message ||
//       "AI service failed. Try again.";

//     res.status(status && status >= 400 ? status : 500).json({
//       success: false,
//       message: msg,
//     });
//   }
// };


const dotenv = require("dotenv");
const { buildKnowledgeBase, getSystemPrompt } = require("../utils/knowledgeBase");
const { getGroqClient } = require("../utils/getGroqClient");

dotenv.config();

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const chatbotController = async (req, res) => {
  try {
    const message = req.body?.message ?? req.body?.query;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Missing message or query in request body",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "GROQ_API_KEY is not set in server .env. Get a free key at https://console.groq.com",
      });
    }

    // ✅ Get ESM client safely
    const groq = await getGroqClient();

    const knowledge = await buildKnowledgeBase();
    const systemPrompt = getSystemPrompt(knowledge);

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 1024,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "No response from the model.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Groq API error:", error?.message);

    res.status(500).json({
      success: false,
      message: "AI service failed. Try again.",
    });
  }
};

module.exports = { chatbotController };