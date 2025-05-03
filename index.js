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

app.get('/', (req, res)=>{
    res.send("Home")
})
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

const RouterUser = require('./routers/user')
const RouterProduct = require('./routers/product')
const RouterOrder = require('./routers/order')

const apiRouter = express.Router();
apiRouter.use('/user',RouterUser)
apiRouter.use('/product',RouterProduct)
apiRouter.use('/order',RouterOrder)

// app.use('/api', [RouterUser,RouterProduct ,RouterOrder ])
app.use('/api', apiRouter)