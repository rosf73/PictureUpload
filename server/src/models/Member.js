const mongoose = require('mongoose')
const crypto = require('crypto')
const Schema = mongoose.Schema
const config = require('../config')

const Member = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  userid: { type: String, required: [true, 'UserID is required!'], unique: true, lowercase: true },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required!'] },
  nickname: { type: String, required: [true, 'Nickname is required!'], trim: true },
  gender: {
    type:Number,
    default:0,
  },
  birth: {
    type:Date,
  },
  profileLink: {
    type:String,
    required:[true, 'Profile is required!'],
  },
  isAdmin: { type: Boolean, default: false }
});

// create new Member document
Member.statics.create = function(userid, email, password, nickname, profileLink) {
  const encrypted = crypto.createHmac('sha1', config.secret)
  .update(password)
  .digest('base64');

  const member = new this({
      userid,
      email,
      password: encrypted,
      nickname,
      profileLink
  })

  // return the Promise
  return member.save()
}

// create new Member document
Member.statics.facebookCreate = function(userid, password, nickname, profileLink) {
  const encrypted = crypto.createHmac('sha1', config.secret)
  .update(password)
  .digest('base64');

  const member = new this({
      userid,
      email: userid,
      password: encrypted,
      nickname,
      profileLink
  })

  // return the Promise
  return member.save()
}

// find one member by using email
Member.statics.findOneByUserID = function(userid) {
  return this.findOne({
      userid
  }).exec()
}

// verify the password of the Member documment
Member.methods.verify = function(password) {
  const encrypted = crypto.createHmac('sha1', config.secret)
  .update(password)
  .digest('base64')
  //console.log(this.password, encrypted);
  return this.password === encrypted
}

Member.methods.assignAdmin = function() {
  this.isAdmin = true
  return this.save()
}

module.exports = mongoose.model('Member', Member)
