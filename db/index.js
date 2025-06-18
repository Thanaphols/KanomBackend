require('dotenv').config();
const mysql =require('mysql2');

const connection = mysql.createConnection({
    user: process.env.db_user,
    password: process.env.db_pass,
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db_name,
})

connection.connect((error)=>{
    if(error){
        console.log("Database Connect Failed")
    }else{
        console.log("Database Connect Success")
    }
})

module.exports = connection.promise();