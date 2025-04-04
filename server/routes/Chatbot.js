const express = require("express");
const { chatBotController } = require("../controllers/ChatBot");

const router = express.Router();

router.post("/chatbot", chatBotController);

module.exports = router;