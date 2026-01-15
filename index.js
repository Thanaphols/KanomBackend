const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config();
const http = require('http')
const {Server} = require('socket.io')
const  rateLimit = require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 0.3 * 60 * 1000, 
	limit: 300, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 56,
	
})
const PORT = process.env.app_port;
const server = http.createServer(app);
const io = new Server(server , {
    cors: {
        origin : '*',
    }
})
io.on('connection', (socket) => {
    console.log('📡 client connected:', socket.id)
    socket.on('disconnect', () => {
        console.log('❌ client disconnected:', socket.id);
  });
})
app.use(bodyParser.json({ limit: "50mb" }));
app.use(limiter)
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
app.set('trust proxy', 1);
//Routers
const RouterUsers = require('./routers/user')
const RouterProduct = require('./routers/product')
const RouterOrder = require('./routers/order')
const RouterCategory = require('./routers/category')
const RouterAuth = require('./routers/auth');
const RouterCart = require('./routers/cart');
const RouterCost = require('./routers/cost');
const Routerfinancials = require('./routers/financials');
const RouterStore = require('./routers/store');
const RouterDashboard = require('./routers/dashboard');
const { Socket } = require('dgram');
const apiRouter = express.Router();
apiRouter.use('/cart',RouterCart)
apiRouter.use('/users',RouterUsers)
apiRouter.use('/products',RouterProduct)
apiRouter.use('/orders',RouterOrder)
apiRouter.use('/category',RouterCategory)
apiRouter.use('/cost',RouterCost)
apiRouter.use('/finan',Routerfinancials)
apiRouter.use('/stores',RouterStore)
apiRouter.use('/auth',RouterAuth)
apiRouter.use('/dashboard',RouterDashboard)
app.use('/api', apiRouter)

app.get('/', (req, res)=>{
    res.status(200).send("Welcome TO Barn farm Kanom")
})
app.set('io', io)

server.listen(PORT, (error) =>{
    if(!error) {
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
        console.log('Welcome http://localhost:'+PORT)
    } else {
        console.log("Error occurred, server can't start", error);
    }
});

app.use('/uploads/products', express.static('uploads/products'));

