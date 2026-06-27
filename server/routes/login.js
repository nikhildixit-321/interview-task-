const express = require("express")
const router = express.Router();
const User = require("../models/user")

router.post('/', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await User.matchPasswordAndGenerateToken({ email, password });
        return res.json({
            message: "Login successful",
            token: token
        })
    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message })
        }

        if (error.message === "Incorrect Password") {
            return res.status(401).json({ message: error.message })
        }

        return next(error);
    }
})

module.exports = router;
