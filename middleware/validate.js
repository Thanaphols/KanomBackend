require('dotenv').config()
const jwt = require('jsonwebtoken')
validateToken = (req,res,next)=>{
    const authToken =  req.headers['authorization']
    
    if(!authToken){
        return res.status(401).send({message : 'Unknow Token'})
    }
    let token = authToken.split(' ')[1]
    if(!token){
        return res.status(403).send({message: 'No token provided'})
    }
    jwt.verify(token, process.env.SECRET_KEY_Token,(err,decode)=>{
        if(err){
            return res.status(403).send({message : 'Unauthorized ! Token expire'})
        }
        req.userName = decode
        //console.log('decode',decode)
        return next()
    })
}

const authJwt = {
    validateToken
}
module.exports = authJwt