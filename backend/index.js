import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import openaiRouter from './src/endpoints/openaiRouter';
// TODO : cors 오류 해결
const app = express();
const port = 8000;
const domain = 'localhost:8000';
app.use(bodyParser.json());
app.use(cors({ origin: domain }));

app.use('/api/openai', openaiRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
