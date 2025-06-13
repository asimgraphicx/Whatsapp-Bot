const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fetch = require('node-fetch');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDd91YaWU1rPHfj50K3AgIao0F5gdjtAxY';

// GitHub training file link (replace with your actual link)
const TRAINING_URL = 'https://raw.githubusercontent.com/username/repo/main/train.txt';

async function getTrainingText() {
  try {
    const response = await fetch(TRAINING_URL);
    return await response.text();
  } catch (err) {
    console.log('Training file load error:', err.message);
    return 'You are a helpful WhatsApp assistant.';
  }
}

async function callGeminiAPI(userMessage) {
  try {
    const trainingText = await getTrainingText();
    const prompt = `${trainingText}\n\nUser: ${userMessage}\nBot:`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.log('Gemini API error:', err.message);
    return 'Sorry, I am having trouble connecting to my brain right now. Please try again!';
  }
}

const client = new Client();

client.on('qr', qr => {
  console.log('Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🤖 WhatsApp Bot is ready!');
});

client.on('message', async msg => {
  const userMessage = msg.body;
  console.log(`Received: ${userMessage}`);
  
  const botReply = await callGeminiAPI(userMessage);
  msg.reply(botReply);
});

client.initialize();
