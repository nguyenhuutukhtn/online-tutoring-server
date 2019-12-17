var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../Model/Users');

const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/changePassword', passport.authenticate('jwt', { session: false }), function (req, res, next) {
  let tokens = req.headers.authorization.split(" ")[1];
  var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
  let saltround = 10;
  userModel.singleById(jwtPayload.userId)
    .then(currentUser => {
      if (currentUser.length === 0) {
        res.status(400).json({ message: "account do not exist" });
        return;
      }
      let ret = bcrypt.compareSync(req.body.currentPassword, currentUser[0].password);
      if (!ret) {
        res.status(400).json({ message: "change password failed, current password incorrect!!!" });
        return;
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        res.status(400).json({ message: "change password failed, confirm password do not match with new password!!!" })
        return;
      }
      let hash = bcrypt.hashSync(req.body.newPassword, saltround);
      userModel.changePassword(jwtPayload.userId, hash)
        .then(() => {
          res.status(200).json({ message: "change password successfully" })
          return;
        })
        .catch(err => {
          res.status(400).json({ message: err });
        })
    });
});

router.post('/changeProfile', passport.authenticate('jwt', { session: false }), function (req, res, next) {

  let tokens = req.headers.authorization.split(" ")[1];
  var jwtPayload = jwt.verify(tokens, 'your_jwt_secret');
  userModel.updateProfile(req.body.name, req.body.address, jwtPayload.userId);
  res.status(200).json({
    message: "update successfully",
  });
});

router.get('/profile', function (req, res) {
  let userId = req.query.id;
  userModel.singleById(userId)
    .then(user => {
      return res.status(200).json({
        data: {
          userId: user[0].id,
          name: user[0].name,
          avatar: user[0].avatar,
          address: user[0].address,
          pricePerHour: user[0].price_per_hour,
          role: user[0].role
        }
      })
    })
    .catch(err => {
      return res.status(500).json({ error: err.toString() })
    })
});



/* POST login. */
router.post('/login', function (req, res, next) {
  passport.authenticate('user-local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info.message,
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      //generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({ name: user[0].name, userId: user[0].id, role: user[0].role }, 'your_jwt_secret');
      return res.json({ name: user[0].name, userId: user[0].id, role: user[0].role, avatar: user[0].avatar, address: user[0].address, pricePerHour: user[0].price_per_hour, token });
    });
  })(req, res);
});

router.post('/loginFB', function (req, res, next) {
  passport.authenticate('user-facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      //generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({ name: user[0].name, userId: user[0].id, role: user[0].role }, 'your_jwt_secret');
      return res.json({ name: user[0].name, userId: user[0].id, role: user[0].role, token });
    });
  })(req, res);
});

router.post('/loginGG', function (req, res, next) {
  passport.authenticate('user-google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      //generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign({ name: user[0].name, userId: user[0].id, role: user[0].role }, 'your_jwt_secret');
      return res.json({ name: user[0].name, userId: user[0].id, role: user[0].role, token });
    });
  })(req, res);
});

router.post('/register', function (req, res, next) {
  let saltround = 10;
  if (!req.body.email || !req.body.name || !req.body.password) {
    res.status(400).json({ message: 'please input email, name, password to create account!!!!' });
    return;
  }
  userModel.findByEmail(req.body.email).then((currentUser) => {
    if (currentUser.length !== 0) {
      res.status(400).json({ message: "create account failed, email is already exist!!!" })
    } else {
      let hash = bcrypt.hashSync(req.body.password, saltround);
      let newUser = {
        email: req.body.email,
        name: req.body.name,
        password: hash,
        role: req.body.role,
      };
      userModel.add(newUser);
      res.status(200).json({ message: 'create account successfully!!!' });
    }
  })
});

module.exports = router;
