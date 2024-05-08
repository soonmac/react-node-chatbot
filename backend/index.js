import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import openaiRouter from './src/endpoints/openaiRouter';
dotenv.config();

const app = express();
const port = 8000;

const whitelist = ['http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not Allowed Origin!'));
    }
  },
};
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/api/openai', openaiRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
