var express = require('express');
var router = express.Router();
var multer = require('multer');
var passport = require('passport');
var localstratgy = require('passport-local').Strategy;
var upload = multer({ dest: './uploads ' })

var user = require('../models/user')
    /* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register' });
});
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
});
router.post('/login',
    passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'invalid username or password' }),
    function(req, res) {
        req.flash('sucess', 'you are now logeed in ');
        res.redirect('/');
    });

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getuserbyid(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new localstratgy(function(username, password, done) {
    User.getuserbyusername(username, function(err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'unknow user' })
        }
        User.comparepassword(password, user.password, function(err, isMatch) {
            if (err) throw done(err);
            if (isMatch) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'invalid password' });
            }
        })
    })
}))

router.post('/register', upload.single('profileimage'), function(req, res, next) {
    var name = req.body.name
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var password2 = req.body.password2

    if (req.file) {
        console.log('uploading file ......')
        var profileimage = req.file.filename
    } else {
        console.log('no file uploading ')
        var profileimage = 'noimage.jpg'
    }

    req.checkBody('name', 'name field is required').notEmpty();
    req.checkBody('email', 'email field is required').notEmpty();
    req.checkBody('email', 'email field is not valid').isEmail();
    req.checkBody('username', 'username field is required').notEmpty();
    req.checkBody('password', 'password field is required').notEmpty();
    req.checkBody('password2', 'passwords dont match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        var newuser = new user({
            name: name,
            email: email,
            username: username,
            password: password,
            profileimage: profileimage
        })
        user.createuser(newuser, function(err, user) {
            if (err) throw err;
            console.log(user);
        })
        req.flash('success', 'you are registered and can login')
        res.location('/')
        res.redirect('/')
    }
});
module.exports = router;