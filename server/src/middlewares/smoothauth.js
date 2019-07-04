const jwt = require('jsonwebtoken')
const utils = require('../common/utils')

const smoothAuthMiddleware = (req, res, next) => {
  // read the token from header or url 
  console.log("???");
  const token = req.headers['x-access-token'] || req.query.token

  // token does not exist
  if(utils.isEmpty(token)) {
      return next()
  }

  // create a promise that decodes the token
  const p = new Promise(
      (resolve, reject) => {
          jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
              if(err) reject(err)
              resolve(decoded)
          })
      }
  )

  // if it has failed to verify, it will return an error message
  const onError = (error) => {
      console.log("의읭??");
      console.log(error);
      next()
  }

  // process the promise
  p.then((decoded)=>{
      console.log(decoded)
      req.decoded = decoded
      next()
  }).catch(onError)
}

module.exports = smoothAuthMiddleware