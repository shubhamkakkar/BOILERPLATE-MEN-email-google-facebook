const express = require("express")
const passport = require("passport")
const router = express.Router()
const mongoose = require("mongoose")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
require("../models/User")
const User = mongoose.model("UserModel")
// 
// require("../passport/passportLocal")(passport)

let USER = {}

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match user
    User.findOne({ email })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'No User Found' });
            }
            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password Incorrect' });
                }
            })
        })
}));
passport.serializeUser((user, done) => {
    USER = user
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

router.post('/',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ data: USER.email, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, "Secret");
        return res.status(200).json({ token })
    });

module.exports = router