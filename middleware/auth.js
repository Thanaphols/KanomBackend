authVerify = (req,res,next) => {
    const {u_ID} = req.body
    const auth_ID = req.userData.u_ID
    if (!u_ID || !auth_ID) {
        return res.status(400).send({message : `Unauthorized`})
    }
    if(u_ID != auth_ID ) {
        return res.status(400).send({message: `Do not have permission to do this !!`})
    }
    return next()
}
const Verity = {
    authVerify
}
module.exports = Verity