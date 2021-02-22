import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = '',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

// TODO gagnagrunnstengingar
const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  const client = await pool.connect();
  const result = await client.query(q, values);
  return result;
  /*let rows = '';
  try {
    let result = await client.query(query, values);
    rows = result.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }

  await pool.end();
  return rows;*/
}
