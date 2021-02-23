import bcrypt from 'bcrypt';
import { query } from './db.js';

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }
  return false;
}

// Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// app.js gerir ráð fyrir async falli
export async function findByUsername(username) {
  try {
    const result = await query('SELECT * FROM users WHERE name = $1', [username]);
    if (result) {
      return result.rows[0];
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}
