var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

const Comment = new Schema({
  //_id: mongoose.Schema.Types.ObjectId, // default로 존재
  commentWriterID: {
    type:Schema.Types.ObjectId,
    ref:'Member',
    required:[true,'commentWriterID is required!'],
  },
  commentContents: {
    type:String,
    default:'',
  },
  commentDate: {
    type:Date,
    default:Date.now,
  },
});

module.exports = mongoose.model('Comment', Comment)