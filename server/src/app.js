/* =======================
    LOAD THE DEPENDENCIES
==========================*/
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
/* =======================
    LOAD THE CONFIG
==========================*/
const config = require('./config')
const winston = require('./configs/winston')

const app = express()

//create log;
app.use(morgan("combined", { stream: winston.stream }));

//console.log(__dirname);
app.use(express.static(__dirname + '/../uploads'));

//app.use('/member', express.static('uploads/member'));

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// print the request log on console
app.use(morgan('dev'))

// set the secret key variable for jwt
app.set('jwt-secret', config.secret)

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// configure api router
app.use('/api', require('./routes/api'))

/* =======================
    CONNECT TO MONGODB SERVER
==========================*/
mongoose.connect(config.mongodbUri, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', console.error)
db.once('open', ()=>{
    console.log('connected to mongodb server')
})

module.exports = app;
