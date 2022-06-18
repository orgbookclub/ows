#!/usr/bin/node

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

const ENV_FILE_PATH = '.development.env';
const OLD_DATABASE = 'production';
const NEW_DATABASE = 'ows';

async function main() {
  getEnvVariables();
  const client = await getMongoClient();
  const oldDb = client.db(OLD_DATABASE);
  const newDb = client.db(NEW_DATABASE);
}

async function getMongoClient() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

function getEnvVariables() {
  config({ path: ENV_FILE_PATH });
}

main();