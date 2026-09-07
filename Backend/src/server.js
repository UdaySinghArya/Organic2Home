import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

async function start() {
  await mongoose.connect(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Organic2Home API listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
