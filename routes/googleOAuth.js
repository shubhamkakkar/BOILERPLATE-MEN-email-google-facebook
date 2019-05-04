const express = require("express")
const mongoose = require("mongoose")
const passport = require("passport")
const jwt = require('jsonwebtoken');

const GoogleStrategy = require("passport-google-oauth20").Strategy

const { clientSecret, client_id } = require("../credentials")

require("../models/User")
const User = mongoose.model("UserModel")

const router = express.Router()

let NEWUSER = {}

passport.use(new GoogleStrategy({
    clientSecret,
    clientID: client_id,
    callbackURL: "/google/signinwithgoogle/callback",
    proxy: true
    //to allow load with https
}, (accessToken, refreshToken, profile, done) => {
    NEWUSER = {
        email: profile.emails[0].value,
        name: profile.name.givenName + profile.name.familyName,
        image: profile.photos[0].value,
        password: "GoogleAuthenticationUSed: No password available"
    }
    User.findOne({
        googleID: profile.id
    }).then(user => {
        if (user) {
            done(null, user)
        } else {
            new User(NEWUSER).save()
                .then(user => done(null, user))
        }
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    GoogleUser.findById(id)
        .then(user => done(null, user))
})


router.get("/signinwithgoogle", passport.authenticate("google", {
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ]
}))

router.get('/signinwithgoogle/callback',
    passport.authenticate('google', { failureRedirect: '/fail' }),
    function (req, res) {
        const token = jwt.sign({ data: NEWUSER.email, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, "Secret");
        return res.status(200).json({ NEWUSER, token })
    });


module.exports = router