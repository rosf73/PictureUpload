var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;

// mongodb는 기본적으로 _id라는 primary key가 생성된다.
// 1 : Squalions, 자식이 부모의 id를 가짐
const Post = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  postWriterID: {
    type:Schema.Types.ObjectId,
    ref:'Member',
    required:[true,'Writer ID is required!'],
  },
  postTitle: {
    type:String,
    required:[true,'Title is required!'],
  },
  postContents: {
    type:String,
    default:'',
  },
  postMarkerLink: { // Post 마커 이미지 링크
    type:String,
    default:'',
  },
  postImageLink: { // Post 메인 이미지 링크
    type:String,
    default:'',
  },
  postDate: {
    type:Date,
    default:Date.now,
  },
  numOfLikes: {
    type:Number,
    default:0,
  },
  numOfViews: {
    type:Number,
    default:0,
  },
  geo: {
    type: [Number],
    index: '2d',
    default: null
  },
  tagList: [String],

  hiddenTagList: [String],
  contentsList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contents' }], // 사진 목록, 1:N
  commentList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // 댓글 목록, 1:N
});

Post.pre('remove', function(next) {
  contentsList = [];
  console.log("dfafdsa");
  console.log(this);

  for (var i = 0; i < this.contentsList.length; ++i) {
    contentsList.push(this.contentsList[i]);
  }
  console.log(contentsList);

  fs.unlink("uploads/" + this.postMarkerLink, (err) => {
    if (err) {
      console.log(err);
      //throw "Can't delete!"
    }
    else console.log('File deleted!');
  });
  
  for (var i = 0; i < contentsList.length; ++i) {
    this.model('Contents').findById(contentsList[i])
    .then( contents => {
      console.log('link::');
      console.log(contents.link);
      fs.unlink("uploads/" + contents.link, (err) => {
        if (err) {
          console.log(err);
          //throw "Can't delete!"
        }
        else console.log('File deleted!');
      });

      contents.delete( (err, contents) => {
        if (err) {
          console.log(err);
          throw "Can't delete!"
        }
        else console.log('Contents document deleted!');
      });
    })
    .catch( err => {
      console.log(err);
    });
  }

  for (var i = 0; i < this.commentList.length; ++i) {
    this.model('Comment').findOneAndDelete({_id:this.commentList[i]})
    .then( comment => {
      console.log(comment);
    })
    .catch( err => {
      console.log(err);
      throw "Can't delete!"
    });
  }

  this.model('Liking').remove({likingPostID: this._id}).exec();

  next();
});

Post.statics.findPostByQuery = function(query) {
  console.log(query);
  return this.find(query).populate('contentsList postWriterID').exec();
}

/*
Post.statics.findPostByQueryWithSelect = function(query) {
  return this.find(query).populate({path: 'contentsList postWriterID', select:'link contentsType nickname profileLink'}).exec();
}
*/

Post.statics.findPostByQueryTotal = function(query) {
  return this.find(query).sort({"numOfLikes":-1, "numOfViews":-1, "postDate":-1}).populate('contentsList').exec();
}

Post.statics.findPostCommentByQuery = function(id) {
  //return this.findById(id).populate('commentList').exec();
  return this.findById(id).populate({path: 'commentList', populate: {path: 'commentWriterID', select:{'nickname':1, 'profileLink':1}}}).exec();
}

Post.statics.findOnePostByQuery = function(query) {
  return this.findOne(query).exec();
}

Post.statics.findHotPostByQuery = function(query){
  return this.find(query).sort({"numOfLikes":-1, "numOfViews":-1, "postDate":-1}).exec();
}

Post.statics.findLimitPostByQuery = function(query, limitN){
  return this.find(query).sort({"numOfLikes":-1, "numOfViews":-1, "postDate":-1}).limit(limitN).populate('contentsList').exec();
}

module.exports = mongoose.model('Post', Post)
