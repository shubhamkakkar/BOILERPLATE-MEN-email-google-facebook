const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const jwt = require('jsonwebtoken');

const bcrypt = require("bcryptjs")

//requireing UserModel
require("../models/User")
const User = mongoose.model("UserModel")


router.post("/email", (req, res) => {
    const errors = []
    const { name, email, confirmPassword } = req.body
    let { password } = req.body
    if (password.length < 6) {
        errors.push({ error: "Password must have length atleast 6" })
    }
    if (confirmPassword !== password) {
        errors.push({ error: "Passwords dont match" })
    }
    if (errors.length) {
        return res.status(400).json(errors)
    } else {
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                                console.log(err)
                                throw err
                            } else {
                                password = hash
                                const newUser = new User({
                                    name, email, password
                                })
                                newUser.save()
                                    .then(saveSuccess => saveSuccess)
                                    .catch(er => console.log(er))
                                const token = jwt.sign({ data: email, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, "Secret");

                                return res.status(200).json({ user: newUser, token })
                            }
                        });
                    });
                } else {
                    console.log(user)
                    return res.status(400).json({ error: `User with the ${email} already exists` })
                }
            })
            .catch(er => er)
    }
})

module.exports = router