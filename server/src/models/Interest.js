var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

const Interest = new Schema({
  //_id: mongoose.Schema.Types.ObjectId, // default로 존재
  interestMemberID: {
    type:Schema.Types.ObjectId,
    ref:'Member',
    required:[true,'interestMemberID is required!'],
  },
  interesting: {
    type:Map,
    of: Number,
  },
});

module.exports = mongoose.model('Interest', Interest)