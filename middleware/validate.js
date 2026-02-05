//middleware/validate.js
require('dotenv').config()
const jwt = require('jsonwebtoken')
validateToken = (req,res,next)=>{
    const authToken =  req.headers['authorization']
    //console.log(authToken)
    if(!authToken){
        return res.status(401).send({message : 'Unknow Token',status : 0})
    }
    let token = authToken.split(' ')[1]
    if(!token){
        return res.status(403).send({message: 'No token provided',status : 0})
    }
    jwt.verify(token, process.env.SECRET_KEY_Token,(err,decode)=>{
        if(err){
            return res.status(403).send({message : 'Unauthorized ! Token expire',status : 0})
        }
        req.userData = decode
        return next()
    })
}

const authJwt = {
    validateToken
}
module.exports = authJwt
