const express = require('express');
const router = express.Router();
const fs = require("fs");
require("dotenv").config({ path: "./config.env" });
// import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY});


router.post('/', async (req, res) => { 
    try {
        const messages = [
        new SystemMessage("You are a helpul Resume Parser AI assistant."),
        new HumanMessage({
            content: [
            { type: 'text', text: 'Please parse the resume and provide me with the JSON data of the resume.' },
            { type: 'image_url', image_url: req.body.file }, // Include the image here
            ],
        }),
        ];
        const response = await chatModel.invoke(messages);
        console.log('Response from Google GenAI:', response);
        res.status(200).json({
            success: true,
            message: 'Document parsed successfully',
            data: response
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error processing request: ' + error.message 
        });
    }
});
module.exports = router;