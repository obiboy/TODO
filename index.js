var express = require('express');
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var session = require('express-session');
var User = require('./models/User');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/TODO');

//setup
app.set('view engine',  'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({secret: 'sljdfhalsdkfj', saveUninitialized: true, resave: true}));

var authenticated = function(req, res, next){
  if(req.session && req.session.user) return next();

  return res.redirect('/login');
}

//routes
app.get('/me', authenticated, function(req,res){
  res.send(req.session.user);
});

app.get('/', function(req, res){
  res.render('index', {title: 'home'});
});

app.get('/login', function(req, res) {
  res.render('login', {title: "login"});
});

app.post('/login', function(req, res){
  User.findOne({username: req.body.username}, function(err, user) {
    if(err) return res.render('error', {error: err + req.body.username, title: 'error'});
    if(!user) return response.render('error', {error: 'user does not exist'});

    if (user.compare(req.body.password)){
      req.session._id = user;
      req.session.save();

      console.log('logged in: ' + user.username)

      res.redirect('/me');
    } else {
      return res.render('error', {error: 'Incorrect credentials', title: 'error'})
    }
  });
});

app.post('/register', function(req, res){
  if(req.body.username && req.body.password){
    //register
    User.create({
      username: req.body.username,
      password: req.body.password
    }, function(error, user){
      if(error){
        res.render('error', {
          title: 'error',
          error: 'user was not created for some reason'
        });
      } else {
        res.send(user);
      }
    });
  } else {
    response.render('error',{
      title: 'error',
      error:'username or password required'
    });
  }
});

app.get('/users.json', function(req,res){
  User.find({}, function(err, users) {
    if(err)throw err;

    res.send(users);
  });
});

app.get('/register', function(req, res){
  res.render('register', {title: 'register'});
});

app.listen(3000);
