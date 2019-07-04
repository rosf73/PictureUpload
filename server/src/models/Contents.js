var mongoose = require('mongoose');
const Schema = mongoose.Schema

// mongodb는 기본적으로 _id라는 primary key가 생성된다.
const Contents = new Schema({
  //_id: mongoose.Schema.Types.ObjectId, // default로 존재
  link: {
    type:String,
    required:[true,'Contents is required!'],
  },
  contentsType: { // 0: 이미지, 1: 비디오
    type:Number,
    required:[true,'type is required!'],
  },
});


// create new Contents document
/*
Contents.statics.create = function(link, contentsType) {
  const contents = new this({
    link,
    contentsType
  });

  // return the Promise
  return contents.save()
}
*/

module.exports = mongoose.model('Contents', Contents)