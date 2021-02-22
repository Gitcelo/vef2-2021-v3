import { promises } from 'fs';
import faker from 'faker';
import { query } from './db.js'

const schemaFile1 = './sql/schema.sql';
const schemaFile2 = './sql/users.sql';

async function mock() {

  for (let i = 0; i < 500; i++) {
    console.log(i);
    let name = faker.name.findName();
    const kt = Math.floor(Math.random()*(9000000000)+1000000000);
    let ath = '';
    let anon = true;
    if(Math.random()<0.5){ath = faker.lorem.sentence();}
    if(Math.random()<0.5) {anon = false; name='Nafnlaust';}
    const q = `
      INSERT INTO signatures (name, nationalID, comment, anonymous)
      VALUES ($1, $2, $3, $4)`;
    try{
    await query(q, [name, kt, ath, anon]);
    }
    catch(e) {
      console.log(e);
    }
  }
  console.log('búið');
}

async function create() {
  const data1 = await promises.readFile(schemaFile1);
  const data2 = await promises.readFile(schemaFile2);

  try{
  await query(data1.toString('utf-8'));
  await query(data2.toString('utf-8'));
  } catch(e) {
    console.error(e);
  }

  console.info('Schema created');

  await mock();

  console.info('Mock data inserted');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});

