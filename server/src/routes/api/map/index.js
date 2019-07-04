const express = require('express')
const util = require('util')
const router = express.Router();

const controller = require('./map.controller')

router.get('/search', controller.search)

module.exports=router
