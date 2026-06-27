const express = require("express")
const router = express.Router();
const User = require("../models/user")

const signup = async (req, res, next) => {
    try {
        const { fullName, name, email, password } = req.body;

        await User.create({ fullName: fullName || name, email, password })
        res.status(201).json({ message: "Registration successful" })
    } catch (error) {
        next(error);
    }
}

router.post('/', signup)
router.post('/register', signup)

router.signup = signup;

module.exports = router;
