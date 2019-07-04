const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Following = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  memberID: {
    ref:'Member',
    type:Schema.Types.ObjectId,
    required:[true,'memberID is required!'],
  },
  followingMemberID: {
    ref:'Member',
    type:Schema.Types.ObjectId,
    required:[true,'followingMemberID is required!'],
  },
});

Following.statics.findFollowingByMemberID = function(memberID) {
  console.log(memberID);
  return this.find({memberID}).populate('followingMemberID', 'profileLink nickname').exec();
}

Following.statics.findOneFollowingByQuery = function(query) {
  return this.findOne(query).exec();
}

module.exports = mongoose.model('Following', Following)