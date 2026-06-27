require('dotenv').config()
const express = require("express")
const cors = require('cors')
const loginRouter = require("./routes/login")
const signupRouter = require("./routes/signup")
const taskRouter = require("./routes/tasks")
const connectDB = require("./config/db")

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));


connectDB();

app.use('/auth/login', loginRouter)
app.use('/auth/signup', signupRouter)
app.post('/auth/register', signupRouter.signup)
app.use('/tasks', taskRouter)

app.get('/', (req, res) => {
    res.send("Hello World");
})




app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 
