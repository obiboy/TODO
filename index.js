var express = require('express');
var mongoose = require('mongoose');
var pug = require('pug');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var session = require('express-session');

var User = require('./models/User');
var Post = require('./models/Post');

var app = express();
var db = mongoose.connect('mongodb://localhost:27017/TODO');

//setup
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({secret: 'sljdfhalsdkfj', saveUninitialized: true, resave: true}));

var authenticated = function(req, res, next) {
  if(req.session && req.session.user) return next();

  return res.redirect('/login');
}

//routes
app.get('/me', authenticated, function(req, res) {
  res.render('me', {username: req.session.user.username});
});

app.get('/post', authenticated, function(req, res) {
  res.render('post', {title: 'post something!'});
});

app.post('/post', authenticated, function(req, res) {
if(!req.body || !req.body.post) {
  return res.render('error', {error: 'no post found', title: 'error'})
}

//post does exist
Post.create({
  post: req.body.post,
  author: req.session.user._id
}, function(err, post) {
  if(err) return res.render('error', {error: 'error creating post', title: 'error'});

    console.log('created post');
    res.redirect('/status/' + post._id);
  });
});

app.get('/status/:id', function(req, res) {
  Post.findOne({_id: req.params.id}, function(err, post) {
    User.findOne({_id: post.author}, function(e, user) {
      res.render('status', {username: user.username, content: post.post})
    });
  });
});

app.get('/', function(req, res) {
  if(req.session && req.session.user) {
    Post.find({}, null, {sort: {created_at: -1}}, function(err, posts) {
        res.render('index', {title: 'home', posts: posts});
    });
  } else {
    res.render('welcome', {title: 'welcome'});
  }
});

app.get('/login', function(req, res) {
  res.render('login', {title: 'login'});
});

app.post('/login', function(req, res) {
  User.findOne({username: req.body.username}, function(err, user) {
    if(err) return res.render('error', {error: err, title: 'error'});
    if(!user) return res.render('error', {error: 'user does not exist'});

    if (user.compare(req.body.password)) {
      req.session.user = user;
      req.session.save();

      console.log('logged in: '+ user.username)

      return res.redirect('/');
    }else{
      return res.render('error', {error: 'incorrect credentials', title: 'error'})
    }
  });
});

app.post('/register', function(req, res) {
  if(req.body.username && req.body.password) {
    //register
    User.create({
      username: req.body.username,
      password: req.body.password
    }, function(error, user) {
      if(error) {
        res.render('error', {
          title: 'error',
          error: 'user was not created for some reason'
        });
      }else{
        return res.redirect('/');
      }
    });
  }else {
    res.render('error', {
      title: 'error',
      error: 'username or password required'
    });
  }
});

app.get('/user.json', function(req, res) {
  User.find({}, function(err, users) {
     if(err)throw err;

     res.send(users);
  });
});

app.get('/register', function(req, res) {
  res.render('register', {title: 'register'});
});

app.get('/user/:username', function(req, res) {
  User.findOne({username: req.params.username}, function(err, user) {
    Post.find({author: user._id}, function(e, posts) {
      res.render('user', {
        user: user,
        posts: posts,
        title: user.username
      });
    });
  });
});

app.listen(3000);
