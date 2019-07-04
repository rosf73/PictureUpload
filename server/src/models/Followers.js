const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Followers = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  memberID: {
    ref:'Member',
    type:Schema.Types.ObjectId,
    required:[true,'memberID is required!'],
  },
  followersID: {
    ref:'Member',
    type:Schema.Types.ObjectId,
    required:[true,'followersID is required!'],
  },
});

Followers.statics.findOneFollowersByQuery = function(query) {
  return this.findOne(query).exec();
}

module.exports = mongoose.model('Followers', Followers)