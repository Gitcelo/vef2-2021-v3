import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import { query } from './db.js';
import { time } from './registration.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

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
  try{
  const result = await query('SELECT * FROM signatures');
  res.render('skraning', { result });
  app.locals.listinn = null;
  } catch(e) {
    console.error('Error selecting', e);
  }
});

app.post(
  '/post',
  body('nafn')
  .isLength({ min: 1 })
  .withMessage('Nafn má ekki vera tómt'),
  body('nafn')
  .isLength({ max: 128 })
  .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('kt')
  .isLength({ min: 1 })
  .withMessage('Kennitala má ekki vera tóm'),
  body('kt')
  .matches(new RegExp(nationalIdPattern))
  .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('ath')
  .isLength({ max:400 })
  .withMessage('Athugasemd má að hámarki vera 400 stafir'),

  (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      app.locals.listinn = errors.array().map(i => i.msg);
      res.redirect('/');
    }
    else {
      app.locals.listinn = null;
      return next();
    }
  },

  	body('name').trim().escape(),
    body('kt').blacklist('-'),
    body('ath').trim().escape(),

    async (req, res) => {
      const {
        nafn,
        kt,
        ath,
        anon,
      } = req.body;

      let result;

      try {
      if(anon === 'on')
        result = await query('INSERT INTO signatures (name, nationalID, comment) VALUES ($1, $2, $3)', ['Nafnlaust', kt, ath]);
      else
          result = await query('INSERT INTO signatures (name, nationalID, comment, anonymous) VALUES ($1, $2, $3, $4)', [nafn, kt, ath, false]);
        res.redirect('/');
      } catch(e) {
        res.render('villa');
      }
    }

  );

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
