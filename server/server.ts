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
      throw new ClientError(400, 'No body');
    }
    if (!body.title || !body.notes || !body.photoUrl) {
      throw new ClientError(400, 'Title, notes, and photoUrl are required');
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

app.get('/api/readEntry/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'EntryId must be an integer');
    const sql = `
    select *
    from "entries"
    where "entryId" = $1
    `;
    const result = await db.query(sql, [entryId]);
    if (!result.rows[0])
      throw new ClientError(404, `Entry with entryId of ${entryId} not found.`);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/update/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'EntryId must be an integer');
    const body = req.body;
    if (!body) {
      throw new ClientError(400, 'No body');
    }
    if (!body.title || !body.notes || !body.photoUrl) {
      throw new ClientError(400, 'Title, notes, and photoUrl are required');
    }
    const sql = `
    update "entries"
    set "title" = $2, "notes" = $3, "photoUrl" = $4
    where "entryId" = $1
    returning *
    `;
    const result = await db.query(sql, [
      entryId,
      body.title,
      body.notes,
      body.photoUrl,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/delete/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId))
      throw new ClientError(400, 'EntryId must be an integer');
    const sql = `
    delete
    from "entries"
    where "entryId" = $1
    returning *;
    `;
    const result = await db.query(sql, [entryId]);
    if (!result.rows[0])
      throw new ClientError(404, `Entry with entryId of ${entryId} not found.`);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
