import express, { response } from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DIRECTORIES } from '../../config/constants.js';
const router = express.Router();
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

router.post('/', async (request, response) => {
  const { chats, name } = request.body;
  const result = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...chats],
  });

  const userMessage = {
    name: 'user',
    is_user: true,
    is_system: false,
    send_date: getCurrentTime(),
    message: chats[chats.length - 1],
    extra: {
      api: 'openai',
      model: 'gpt-3.5-turbo',
    },
  };

  const openAIMessage = {
    name: name,
    is_user: false,
    is_system: false,
    send_date: getCurrentTime(),
    message: result.choices[0].message,
    extra: {
      api: 'openai',
      model: 'gpt-3.5-turbo',
    },
  };

  response.json({
    output: result.choices[0].message,
  });

  saveChat(name, [userMessage, openAIMessage]);
});

function saveChat(name, messages) {
  const directoryPath = path.resolve(__dirname, DIRECTORIES.chats);

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  name = name.replace(/[^a-zA-Z0-9]/g, '_');
  const saveFile = path.join(directoryPath, `chat_${name}.jsonl`);
  const chatLog = {
    session_id: `chat_${name}`,
    messages: messages,
  };
  console.log('saveFile', saveFile);
  const jsonData = messages.map(JSON.stringify).join('\n');
  fs.writeFileSync(saveFile, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('저장 실패', err);
    } else {
      console.log('저장 성공');
    }
  });
}

function getCurrentTime() {
  return new Date().toISOString();
}

export default router;
