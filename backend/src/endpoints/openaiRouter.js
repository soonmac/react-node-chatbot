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

router.get('/getChats', (req, res) => {
  const { name } = req.query;
  const filePath = path.resolve(__dirname, DIRECTORIES.chats, `./chat_${name}.jsonl`);
  console.log(filePath);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('읽기 실패', err);
      return res.status(500).send('못읽음');
    }

    const lines = data.trim().split('\n');
    const jsonArr = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          console.log('JSON 파싱 실패', err);
        }
      })
      .filter((el) => el !== undefined);

    res.json(jsonArr);
  });
});

router.post('/sendChat', async (request, response) => {
  const { chats, name } = request.body;
  const result = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...chats],
  });

  console.log(chats);

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

  saveChat(name, [...chats, result.choices[0].message]);
});

function saveChat(name, messages) {
  const directoryPath = path.resolve(__dirname, DIRECTORIES.chats);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }

  name = name.replace(/[^a-zA-Z0-9]/g, '_');
  const saveFile = path.join(directoryPath, `chat_${name}.jsonl`);
  const jsonData = messages.map(JSON.stringify).join('\n');
  try {
    fs.writeFileSync(saveFile, jsonData, 'utf8');
    console.log('저장성공~', saveFile);
  } catch (err) {
    console.log('저장 실패!', err);
  }
}

function getCurrentTime() {
  return new Date().toISOString();
}

export default router;
