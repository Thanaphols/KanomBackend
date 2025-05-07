const mysql = require('../db')

exports.allCategory = (req,res)=>{
    mysql.query(" SELECT * FROM category " , (err,data)=>{
        if(err){
            console.log(err)
           return res.status(401).send({message : "Some thing weng wrongs" })
        }else{if(data == ''){
            return res.status(400).send({message : "No Data" })
        }else{
            return res.status(200).send({message : "Select All Data success" , data : data })
        }
        }
    })
}
exports.selectCategory = (req,res)=>{
    const id = req.params.c_ID
    if ( id == undefined || id == '' ){ 
        return res.status(400).send({message: "Please Enter All Data"}) 
    }  
    mysql.query(" SELECT * FROM category  WHERE c_ID = ? ",[ id], (err,data)=>{
        if(err){
            console.log(err)
            return res.status(401).send({message : "Some thing weng wrongs" })
        }else{
            if(data == ''){
                return res.status(400).send({message : "No Data" })
            }else{
                return res.status(200).send({message : "Select Data success" , data : data })
            }
           
        }
    })
}

exports.addCategory = ( req,res) =>{
    const name = req.body.c_Name
    name == undefined || name == '' ? res.status(400).send({message : " Please Enter All Data "})  :  console.log(name)
    
    mysql.query( " INSERT INTO category (c_Name)  VALUES ( ? ) ",[ name],(err)=>{
        if(err){
            console.log(err)
            return res.status(400).send({message : " Something weng Wrongs Can't Create Category "})
        }else{
            return res.status(201).send({message: " Create Category Success "})
        }
    } )
}

exports.updateCategory = (req,res)=>{
    const id = req.body.c_ID
    const name = req.body.c_Name
    if ( id == undefined || id == '' || name == undefined || name == ''){ 
        return res.status(400).send({message: "Please Enter All Data"}) 
    }  

    mysql.query(" UPDATE  category set c_Name = ?  WHERE c_ID = ? ",[name, id], (err)=>{
        if(err){
            console.log(err)
            return res.status(401).send({message : "Can't Update Category" })
        }else{
            return res.status(200).send({message : "Update Category" })
        }
    })
}

exports.deleteCategory = (req, res) =>{
    const id = req.body.c_ID
    if(id == undefined || id == ''){
        return res.status(400).send({message : "ID is missing please try again later"})
    }
    mysql.query("DELETE catgory WHERE c_ID = ?" ,[id], (error)=>{
        if(error){
            console.log(error)
            return res.status(401).send({message : "Can't Delete Category" })
        }else{
            return res.status(200).send({message : "Delete Category Success"})
        }
    })
}