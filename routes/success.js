const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()

//userModal
require("../models/User")
const User = mongoose.model("UserModel")

router.get("/", (req, res) => {
    const { email } = req.body

    User.findOne({ email })
        .then(user => {
            console.log(user, email)
        })
        .catch(Er => Er)

    res.status(200).json({ message: "Success" })
})

module.exports = router