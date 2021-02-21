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
app.locals.data = [];
app.locals.bool = false;
app.locals.color = ['', '', ''];

app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res, next) => {
  if (app.locals.bool) {
    res.render('villa');
    app.locals.bool = false; // Eg geri mer grein fyrir ad ef ytt er a reload þa renderast skraning.
    // Eg tel thad vera goda virkni samt og vil thvi halda thvi
  } else next();
});

app.get('/', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM signatures');
    const cnt = await query('SELECT COUNT(*) AS count FROM signatures');
    res.render('skraning', { result, cnt });
    app.locals.listinn = null;
    app.locals.data = [];
    app.locals.color = ['', '', ''];
  } catch (e) {
    console.error('Error selecting', e);
  }
});

app.post('/post', router);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
