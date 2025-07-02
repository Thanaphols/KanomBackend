const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config();

const PORT = process.env.app_port;

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    }),
    cors({
      origin: "*",
      method: ["GET", "POST", "PATCH", "DELETE"],
  })
    
  );

//Routers
const RouterUsers = require('./routers/user')
const RouterProduct = require('./routers/product')
const RouterOrder = require('./routers/order')
const RouterCategory = require('./routers/category')
const RouterAuth = require('./routers/auth')
const apiRouter = express.Router();
apiRouter.use('/users',RouterUsers)
apiRouter.use('/products',RouterProduct)
apiRouter.use('/orders',RouterOrder)
apiRouter.use('/categorys',RouterCategory)
apiRouter.use('/auth',RouterAuth)
app.use('/api', apiRouter)

app.get('/', (req, res)=>{
    res.status(200).send("Welcome TO Barn farm Kanom")
})
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

