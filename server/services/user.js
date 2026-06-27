// yaha token bnata hai ya check kiya jata hai
const jwt = require('jsonwebtoken')
const secrate = 'nikhil'

const createToken = (user) => {
      
      const payload = {
        id: user._id,
        email:user.email
      }

    return jwt.sign(payload, secrate, { expiresIn: '1h' });
}
const  validateToken = (token)=>{
    const payload = jwt.verify(token, secrate);
    return payload
}
module.exports ={
    validateToken,
    createToken
}