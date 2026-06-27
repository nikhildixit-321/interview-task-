const express = require("express")
const router = express.Router();
const User = require("../models/user")
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    try {
        const token = await User.matchPasswordAndGenerateToken({ email, password });
        return res.json({
            message: "Login successful",
            token: token
        })
    } catch (error) {
        return res.status(401).json({ message: error.message || "Invalid credentials" })
    }
})

module.exports = router;