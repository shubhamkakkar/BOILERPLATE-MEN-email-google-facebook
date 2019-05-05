const express = require("express")
const router = express.Router()

const passport = require("passport")
const FacebookStrategy = require("passport-facebook").Strategy

const {
    clientSecretFacebook: clientSecret,
    client_id_facebook: clientID,
    callbackURLFacebook: callbackURL
} = require("../credentials")

const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("UserModel")

const jwt = require('jsonwebtoken');

let NEWUSER = {}

passport.use(new FacebookStrategy({
    clientID,
    clientSecret,
    callbackURL,
},
    (accessToken, refreshToken, profile, cb) => {
        NEWUSER = {
            name: profile._json.name,
            email: profile._json.name + "@facebook.com",
            image: null,
            password: "FacebookAuthenticationUSed: No password available"
        }
        User.findOne({ facebookId: profile.id }, (err, user) => {
            if (user) {
                return cb(err, user);
            } else {
                new User(NEWUSER).save()
                    .then(user => cb(err, user))
            }
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    GoogleUser.findById(id)
        .then(user => done(null, user))
})


router.get("/signinwithfacebook", passport.authenticate("facebook", { scope: ["email"] }))

router.get(
    "/signinwithfacebook/callback",
    passport.authenticate(
        "facebook",
        { failureRedirect: "/fail" }
    ),
    (req, res) => {
        const token = jwt.sign({ data: NEWUSER.email, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, "Secret");
        return res.status(200).json({ user: NEWUSER, token })
    }
)

module.exports = router