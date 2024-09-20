/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { networkInterfaces } from 'os';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());

app.post('/api/create/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body) {
      throw new Error('No body');
    }
    if (!body.title || !body.notes || !body.photoUrl) {
      throw new Error('Title, notes, and photoUrl are required');
    }
    const sql = `
  insert into "entries"
  ("title", "notes", "photoUrl")
   values ($1, $2, $3)
   returning *`;
    const result = await db.query(sql, [body.title, body.notes, body.photoUrl]);
    res.status(201).json('entry added');
  } catch (err) {
    next(err);
  }
});

app.get('/api/readAll', async (req, res, next) => {
  try {
    const sql = `
    select *
    from "entries"
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
