import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { time, router } from './registration.js';
import passport from './login.js';
import { deleteFromTable, paging } from './utils.js';

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
app.locals.message = '';
let offset = 0;

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'leyndó',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

app.get('/', (_req, res, next) => {
  if (app.locals.bool) {
    res.render('villa');
    app.locals.bool = false; // Eg geri mer grein fyrir ad ef ytt er a reload þa renderast skraning.
    // Eg tel thad vera goda virkni samt og vil thvi halda thvi
  } else next();
});

app.get('/', async (req, res) => {
  const { page = 1 } = req.query;
  offset = Number(page);

  try {
    const result = await paging(page, port);
    if (result.bool) {
      res.redirect('/');
    } else {
      res.render('skraning', { result });
      app.locals.listinn = null;
      app.locals.data = [];
      app.locals.color = ['', '', ''];
    }
  } catch (e) {
    console.error('Error selecting', e);
  }
});

app.get('/admin/login', (req, res) => {
  if (req.session.messages && req.session.messages.length > 0) {
    app.locals.message = req.session.messages.join(', ');
    req.session.messages = [];
  } else { app.locals.message = ''; }
  res.render('login');
});

app.get('/admin', async (req, res) => {
  const { page = 1 } = req.query;
  offset = Number(page);
  if (req.isAuthenticated()) {
    try {
      const result = await paging(offset, port, 'admin/');
      if (result.bool) {
        return res.redirect('/admin');
      }
      return res.render('admin', { result });
    } catch (e) {
      return res.render('villa');
    }
  }
  return res.redirect('/admin/login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/admin');
});

app.post('/post', router);

app.post(
  '/login',

  // Þetta notar strat til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (_req, res) => {
    res.redirect('/admin');
  },
);

app.post(
  '/delete',

  async (req, res) => {
    if (req.isAuthenticated()) {
      try {
        deleteFromTable(req.body.number);
        return res.redirect('/admin');
      } catch (e) {
        app.locals.bool = true;
        return res.redirect('/');
      }
    }
    return res.redirect('/admin/login');
  },
);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
