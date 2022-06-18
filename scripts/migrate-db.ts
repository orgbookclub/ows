#!/usr/bin/node

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

const ENV_FILE_PATH = '.development.env';
const OLD_DATABASE = 'production';
const OLD_EVENTS_COLL = 'events';

const NEW_DATABASE = 'ows';
const NEW_EVENTS_COLL = 'events';
const NEW_BOOKS_COLL = 'books';

async function main() {
  getEnvVariables();
  const client = await getMongoClient();
  const oldDb = client.db(OLD_DATABASE);
  const newDb = client.db(NEW_DATABASE);
  await migrateEvents(oldDb, newDb);
}

async function migrateEvents(oldDb, newDb) {
  const eventsOld = oldDb.collection(OLD_EVENTS_COLL);
  // const eventsNew = newDb.collection(NEW_EVENTS_COLL);
  // const booksNew = newDb.collection(NEW_BOOKS_COLL);
  const cursor = eventsOld.find();
  for await (const doc of cursor) {
    console.log(doc.book);
  }

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