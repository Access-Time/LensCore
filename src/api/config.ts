import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  return app;
};
