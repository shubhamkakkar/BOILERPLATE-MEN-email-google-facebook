const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require('bcryptjs')
const router = express.Router()

//mongooseMOdel
require("../models/User")
const User = mongoose.model("UserModel")

router.post("/", (req, res) => {
    const { email, password } = req.body

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: `No user with email : ${email} existts` })
            } else {
                const hash = user.password
                bcrypt.compare(password, hash)
                    .then(bcryptRes => {
                        if (bcryptRes) {
                            return res.status(200).json(user)
                        } elseP
                        return res.status(500).json({ message: "Password doesn't match" })
                    })
                    .catch(er => console.log(er))
            }
        })
        .catch(er => er)
})

module.exports = router