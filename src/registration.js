import express from 'express';
import { app } from './app.js'
import { body, validationResult } from 'express-validator';
import { query } from './db.js';
import xss from 'xss';

// TODO skráningar virkni
const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

export function time(d) {
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

export const router = express.Router();

router.post('/post',
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
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),

  (req, res, next) => { valid(req, res, next); },

  body('name').trim().escape(),
  body('kt').blacklist('-'),
  body('ath').trim().escape(),

  async (req, res) => { insertion(req, res); }
)

function valid(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const {
      nafn,
      kt,
      ath,
      anon=''
    } = req.body;
    const checked = anon.localeCompare('on')===0 ? 'checked':'';
    app.locals.data = [xss(nafn), xss(kt), xss(ath), checked];
    app.locals.listinn = errors.array().map(i => i.msg);
    res.redirect('/');
  }
  else {
    app.locals.listinn = null;
    return next();
  }
}

async function insertion(req, res) {
  const {
    nafn,
    kt,
    ath,
    anon,
  } = req.body;

  try {
    if (anon === 'on')
      await query('INSERT INTO signatures (name, nationalID, comment) VALUES ($1, $2, $3)', ['Nafnlaust', xss(kt), xss(ath)]);
    else
      await query('INSERT INTO signatures (name, nationalID, comment, anonymous) VALUES ($1, $2, $3, $4)', [xss(nafn), xss(kt), xss(ath), false]);
    res.redirect('/');
  } catch (e) {
    app.locals.bool = true;
    res.redirect('/');
  }
}
