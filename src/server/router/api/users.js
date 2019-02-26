const express = require('express');

const router = express.Router();
const uniqueString = require('unique-string');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const passport = require('passport');

const validateLoginInput = require('../../validation/login');
const validateRegisterInput = require('../../validation/register');

const client = new Client({
  // connectionString: process.env.DATABASE_URL,
  user: 'faqiaquxwsvcfl',
  host: 'ec2-54-75-245-94.eu-west-1.compute.amazonaws.com',
  database: 'd2r9omcof890g8',
  password: '8252532b9171685b9ebf552cd307f0aaed95df071d65090b86e6b04781c0f8b1',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: true
});

client.connect();

router.post('/test', (req, res) => {
  client.query('SELECT * FROM public.user;', (errors, user) => {
    if (errors) {
      res.status(404).json(errors);
    }
    // table.rows[0].name
    res.json(user);
  });
});

// Login
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  client.query('SELECT * FROM public.user WHERE email = $1 ;', [req.body.email], (errors, user) => {
    if (errors) {
      res.status(404).json(errors);
    } else if (user.rows.length > 0) {
      bcrypt.compare(password, user.rows[0].password).then((isMatch) => {
        if (isMatch) {
          const payload = {
            id: user.rows[0].user_id,
            name: user.rows[0].name
          };

          jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
            res.json({
              success: true,
              token: `Bearer ${token}`
            });
          }); // log out in 1 hr
        } else {
          res.json('fail');
        }
      });
    } else {
      res.json('There are no account exist');
    }
  });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user_id: req.user.user_id,
    name: req.user.name,
    email: req.user.email
  });
});

// Register
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  client.query('SELECT * FROM public.user WHERE email = $1 ;', [req.body.email], (errors, user) => {
    if (user.rows.length == 0) {
      let hashpass = req.body.password;
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(hashpass, salt, (err, hash) => {
          if (err) throw err;
          hashpass = hash;
          res.json({ hashpass });
          const uniqueID = uniqueString();

          client.query(
            'INSERT INTO public.user( user_id, name, email, password ) VALUES ($1,$2,$3,$4);',
            [uniqueID, req.body.name, req.body.email, hashpass]
          );
        });
      });
    } else {
      res.json({
        msg: 'this email already register'
      });
    }
  });
});
// INSERT INTO public.user("user_id","name", "email","password") VALUES ('1', 'Huy','huy@asd.com','huy123');
// DELETE FROM public.user where "Name" = 'Huy';
// list all users
router.get('/allusers', (req, res) => {
  client.connect((err, db, done) => {
    if (err) {
      return console.log(err);
    }
    db.query('SELECT * FROM public.user;', (errors, user) => {
      if (err) {
        res.status(404).json(errors);
      }
      // table.rows[0].name
      res.json(user);
    });
  });
});

module.exports = router;
