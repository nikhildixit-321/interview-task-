const express = require("express")
const router = express.Router();
const User = require("../models/user")
router.post('/', async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({ fullName, email, password })
    res.json({ message: "Registration successful" })
})

module.exports = router;