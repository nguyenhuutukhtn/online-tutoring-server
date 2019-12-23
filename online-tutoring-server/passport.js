const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UserModel = require('./Model/Users');
const bcrypt = require('bcrypt');

passport.use('user-local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, cb) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        return UserModel.findByEmail(email)
            .then(user => {
                if (user.length === 0) {
                    return cb(null, false, { message: 'Incorrect email.' });
                }
                if (user[0].active === "no") {
                    return cb(null, false, { message: 'Account is lock' });
                }
                let ret = bcrypt.compareSync(password, user[0].password);

                if (ret) {
                    return cb(null, user, { message: 'Logged In Successfully' });
                }
                return cb(null, false, { message: 'Incorrect password.' });
            })
            .catch(err => cb(err));
    }
));

passport.use('user-facebook', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'fbId'
},
    function (name, fbId, cb) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        UserModel.findByFaceBookId(fbId).then((currentUser) => {
            if (currentUser.length !== 0) {
                return cb(null, currentUser, { message: 'Logged In Successfully' });
            } else {
                let newUser = {
                    name,
                    facebookId: fbId,
                    role: "student"
                };
                UserModel.add(newUser)
                    .then(res => {
                        return cb(null, [{ ...newUser, id: res.insertId }], { message: 'Logged In Successfully' });
                    });
            }
        })
    }
));

passport.use('user-google', new LocalStrategy({
    usernameField: 'name',
    passwordField: 'googleId'
},
    function (name, googleId, cb) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        UserModel.findByGoogleId(googleId).then((currentUser) => {
            if (currentUser.length !== 0) {
                return cb(null, currentUser, { message: 'Logged In Successfully' });
            } else {
                let newUser = {
                    name,
                    googleId,
                    role: "student"
                };
                UserModel.add(newUser)
                    .then(res => {
                        return cb(null, [{ ...newUser, id: res.insertId }], { message: 'Logged In Successfully' });
                    });
            }
        })
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    function (jwtPayload, cb) {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return UserModel.singleById(jwtPayload.userId)
            .then(user => {
                //console.log('-----user', user);
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));