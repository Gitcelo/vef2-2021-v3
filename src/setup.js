import { promises } from 'fs';
import faker from 'faker';
import { query } from './db.js';

const schemaFile1 = './sql/schema.sql';
const schemaFile2 = './sql/users.sql';

function getRandomDates(now = (new Date()).getTime(), then = 0) {
  return new Date((now - then) + Math.random() * then);
}

async function insert(q, values = []) {
  try {
    await query(q, values);
  } catch (e) {
    console.error(e);
  }
}

async function mock() {
  const now = new Date().getTime();
  const twoWeeksAgo = 1209600000;
  const q = `
      INSERT INTO signatures (name, nationalID, comment, anonymous, signed)
      VALUES ($1, $2, $3, $4, $5)`;
  for (let i = 0; i < 500; i += 1) {
    let name = faker.name.findName();
    const kt = Math.floor(Math.random() * (9000000000) + 1000000000);
    let ath = '';
    let anon = true;
    if (Math.random() < 0.5) { ath = faker.lorem.sentence(); }
    if (Math.random() < 0.5) { anon = false; name = 'Nafnlaust'; }
    const dags = getRandomDates(now, twoWeeksAgo);
    await insert(q, [name, kt, ath, anon, dags]);
  }
}

async function create() {
  const data1 = await promises.readFile(schemaFile1);
  const data2 = await promises.readFile(schemaFile2);

  try {
    await query(data1.toString('utf-8'));
    await query(data2.toString('utf-8'));
  } catch (e) {
    console.error(e);
  }

  console.info('Schema and users created');

  await mock();

  console.info('Mock data inserted');
}

async function main() {
  await create().catch((err) => {
    console.error('Error creating schema', err);
  });
  process.exit();
}

main();
