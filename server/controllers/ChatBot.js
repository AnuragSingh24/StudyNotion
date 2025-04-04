const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

exports.chatBotController = async (req, res) => {
  const { query } = req.body;
  console.log("User Query:", query);

  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: query }] }],
      }
    );

    console.log("Gemini Response:", response.data);
    return res.json({
      success: true,
      reply: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
    });
  } catch (error) {
    console.log("Error", error);
    console.log("Error message:", error.message);

    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};