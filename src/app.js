import express from 'express';
import dotenv from 'dotenv';
import { query } from './db.js';
import { time, router } from './registration.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

export const app = express();

// TODO setja upp rest af virkni!

app.use(express.static('public'));
app.set('/views', 'views');
app.set('view engine', 'ejs');

app.locals.time = (d) => time(d);
app.locals.listinn = null;
app.locals.nafn = '';
app.locals.kt = '';
app.locals.ath = '';

app.use(express.urlencoded({ extended: true }));

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

app.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM signatures');
    res.render('skraning', { result });
    app.locals.listinn = null;
  } catch (e) {
    console.error('Error selecting', e);
  }
});

app.post('/post', router);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
