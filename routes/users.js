var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../Model/Users');
const messageModel = require('../Model/Message');

const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailAccount = require('../const/emailAccount');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

const smtpTransport = nodemailer.createTransport({
  host: "gmail.com",
  service: "Gmail",
  auth: {
    user: emailAccount.email,
    pass: emailAccount.password
  }
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
          role: user[0].role,
          balance: user[0].balance
        }
      })
    })
    .catch(err => {
      return res.status(500).json({ error: err.toString() })
    })
});

router.get('/activeAccount', async (req, res) => {
  let email = req.query.email;
  let hash = req.query.hash;
  const currentUser = await userModel.findByEmail(email);
  if (currentUser.length === 0) {
    return res.status(400).json({
      message: "unidentified"
    });
  }
  let ret = bcrypt.compareSync(email, hash);
  if (!ret) {
    return res.status(400).json({
      message: "active account fail, wrong hash"
    });
  }
  userModel.activeById(currentUser[0].id)
    .then(() => {
      return res.status(200).json({
        success: "active account successfully"
      });
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

router.post('/register', async (req, res) => {
  let saltround = 10;
  if (!req.body.email || !req.body.name || !req.body.password) {
    res.status(400).json({ message: 'please input email, name, password to create account!!!!' });
    return;
  }
  userModel.findByEmail(req.body.email).then((currentUser) => {
    if (currentUser.length !== 0) {
      return res.status(400).json({ message: "create account failed, email is already exist!!!" })
    } else {
      let hash = bcrypt.hashSync(req.body.password, saltround);
      let newUser = {
        email: req.body.email,
        name: req.body.name,
        password: hash,
        role: req.body.role,
      };
      userModel.add(newUser)
        .then(async () => {
          const hashEmail = bcrypt.hashSync(req.body.email, saltround);
          await sendmailRecover(req.body.email, hashEmail);
          return res.status(200).json({ message: 'create account successfully!!!' });
        })

    }
  })
});

const sendmailRecover = async (email, hash) => {
  const link = `http://localhost:3100/users/activeAccount?email=${email}&hash=${hash}`
  const mailOptions = {
    to: email,
    subject: "Kích hoạt tài khoản smart tutoring",
    html:
      "Chào bạn!,<br> Hãy click vào đường dẫn bên dưới để kích hoạt tài khoản <br><a href=" +
      link +
      ">Click để kích hoạt</a>"
  };
  // eslint-disable-next-line no-unused-vars
  smtpTransport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('-------', error.toString());
    }
  });
};



router.get('/getMessage', async function (req, res, next) {
  const idStudent = req.query.idStudent;
  const idTutor = req.query.idTutor;
  if (!idStudent || !idTutor) {
    return res.status(400).json({ message: 'id invalid, please try again' });
  }
  const allMessage = await messageModel.getAllMessageById(idStudent, idTutor);
  res.status(200).json({ data: allMessage });
});

router.post('/sendMessage', async function (req, res, next) {
  try {
    req.body.time = new Date();
    await messageModel.add(req.body);
    res.status(200).json({ message: 'add message success' });
  } catch (error) {
    return res.status(400).json({ message: 'id invalid, please try again' });
  }
});

router.get('/getConverstationList', async function (req, res, next) {
  const id = req.query.id;
  const listtAllMessage = await messageModel.getAllMessage(id);
  const listId = [];
  listtAllMessage.forEach(elem => {
    let idTemp = elem.idSender == id ? elem.idReceiver : elem.idSender;
    if (!listId.includes(idTemp)) {
      listId.push(idTemp);
    }
  });
  listInfoUser = []
  listId.forEach(elem => {
    const infoUser = userModel.singleById(elem);
    listInfoUser.push(infoUser);
  })
  Promise.all(listInfoUser).then(value => {
    const data = [];
    value.forEach(elem => {
      data.push(elem[0]);
    })
    return res.status(200).json({ data: data });
  })
});
module.exports = router;
