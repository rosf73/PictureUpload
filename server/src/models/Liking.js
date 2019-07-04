const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Liking = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  memberID: {
    ref:'Member',
    type:Schema.Types.ObjectId,
    required:[true,'memberID is required!'],
  },
  likingPostID: {
    ref:'Post',
    type:Schema.Types.ObjectId,
    required:[true,'likingPostID is required!'],
  },
});

Liking.statics.findLikingByQuery = function(query){
  return this.find(query).exec();
}

Liking.statics.findOneLikingByQuery = function(query){
  return this.findOne(query).exec();
}


module.exports = mongoose.model('Liking', Liking)
