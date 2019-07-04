const jwt = require('jsonwebtoken')

const Post = require('../../../models/Post')
const Liking = require('../../../models/Liking')
const Contents = require('../../../models/Contents')
const Comment = require('../../../models/Comment')
const Following = require('../../../models/Following')
const Member = require('../../../models/Member')
const Interest = require('../../../models/Interest')

const CryptoJS = require("crypto-js");
const configs = require('../../../common/configs');
const request = require("request");
const fs = require('fs');
const utils = require('../../../common/utils');
const mongoose = require('mongoose');
const Transaction = require('mongoose-transactions')
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();


/*
    POST /api/board/post
    {
        postContents,
        tagList,
    }
*/
exports.post = async (req, res) => {
  let { postContents, tagList, title } = req.body;
  let lat = req.query.lat;
  let lng = req.query.lng;
  let memberID = req.decoded._id;
  let contentsInfoList = [];
  let contentsIDList = [];
  let hiddenTagSet = {};
  let postImageLink = '';
  let postMarkerLink = '';

  //console.log("꿍");
  //console.log(req.files);
  if (req.files.length <= 0)
  {
    return res.status(413).json({
      message: 'Need files!'
    });
  }

  if (!utils.isEmpty(tagList)) { // 태그 목록 정보가 있을 경우 ','로 나누어줌
    tagList = tagList.split(',');
  }
  else {
    tagList = [];
  }

  if(tagList.length > 20){
    return res.status(413).json({
      message: 'Too many Tags (over 20)'
    });
  }
  if(postContents.length > 50){
    return res.status(413).json({
      message: 'Too many contents (over 50)'
    });
  }
  if(title.length > 20){
    return res.status(413).json({
      message: 'Too many title (over 20)'
    });
  }

  let isWrong = false;

  if (req.files.length == 1 && utils.isVideo(req.files[0].mimetype))
  { // 파일 길이가 1이고 비디오일 경우
    if (req.files[0].size > configs.FILE_LIMIT)
    { // 파일 크기를 초과할 경우
      console.log(req.files[0]);
      isWrong = true;
    }
    else {
      let link = configs.CONTENTS_FOLDER + req.files[0].filename; // 파일 링크를 변수에 저장
      let filename = req.files[0].filename;
      let idx = filename.lastIndexOf('.');
      postImageLink = filename.substring(0, idx) + '_1.png'; // 메인 이미지 링크를 변수에 저장
      postMarkerLink = 'marker_' + postImageLink; // 마커 이미지 링크를 변수에 저장

      postImageLink = configs.CONTENTS_FOLDER + postImageLink; // 저장될 폴더를 링크에 추가
      postMarkerLink = configs.CONTENTS_FOLDER + postMarkerLink

      console.log(req.files[0]);

      ffmpeg(req.files[0].path) // 동영상 파일을 불러옴
      .on('end', () => { // 스크린샷이 촬영 완료되었을 경우
        console.log('Screenshots taken');

        // 메인 이미지 파일 저장이 완료될 경우 marker이미지 생성
        sharp(configs.ROOT_FOLDER + postImageLink).resize({width: 100, height: 100, fit: "fill"}).toFile(configs.ROOT_FOLDER + postMarkerLink)
        .then( newFileInfo => {
          //console.log(newFileInfo);
          console.log('Success!');
        })
        .catch( err => {
          //console.log(err);
          console.log('Error occured!');
        });
      })
      .screenshots({ // 동영상의 중간 부분을 캡쳐하여 메인 이미지를 만들어 저장
        //timemarks:"50%",
        timestamps: ['50%'],
        filename: postImageLink,
        folder: configs.ROOT_FOLDER,
        size: '320x240'
      });

      for (var i = 0; i <= 99; i += 33) { // 동영상 0%, 33%, 66%, 99% 간격 별 이미지를 분석 후 hiddenTagList를 만듬
        var tempfilelink = configs.TEMP_FOLDER + filename.substring(0, idx) + '_temp.png'; // 임시 이미지 파일을 저장할 링크
        var percent = String(i) + '%';

        const p = new Promise((resolve, reject) => {
          ffmpeg(req.files[0].path)
            .on('error', (err) => {
              reject(err);
            })
            .on('end', () => { // 이미지 촬영이 완료되었을 경우 resolve 처리
              resolve();
            })
            .screenshots({ // 동영상에서 percent 부분을 캡처하여 임시 이미지 파일 저장
              //timemarks:"50%",
              timestamps: [percent],
              filename: tempfilelink,
              folder: configs.ROOT_FOLDER,
              size: '320x240'
            });
        });

        var success = await (p).then(result => {
          //console.log("Success!");
          return true;
        }).catch(error => {
          //console.log("Fail!");
          return false;
        });

        if (success) {
          const [result] = await client.labelDetection(configs.ROOT_FOLDER + tempfilelink); // 임시 이미지 파일을 분석
          const labels = result.labelAnnotations;

          const hiddenTagList = labels.filter(label => { // 분석 결과 score(점수)가 SCORE_LIMIT 이상일 경우만 필터링
            if (label.score > configs.SCORE_LIMIT) {
              return true;
            }
            return false;
          }).map(label => { // 분석 결과의 설명 부분을 반환
            return label.description;
          });

          for (var j = 0; j < hiddenTagList.length; j++)
          { // 분석 결과를 dictinary 변수에 기록
            hiddenTagSet[hiddenTagList[j]] = 1;
          }
        }
      }

      contentsIDList.push(new mongoose.Types.ObjectId()); // 게시글의 컨텐츠 ID 목록애 ID 정보 push

      let contentsInfo = {
        _id: contentsIDList[0],
        link: link,
        contentsType: 1 // Video 타입
      };

      contentsInfoList.push(contentsInfo); // 컨텐츠 정보 목록에 컨텐츠 정보 push
    }
  }
  else { // 그 외의 경우 (파일 길이가 2이상이거나 0번째 파일이 비디오가 아닐 경우)
    let fileSize = 0;

    for (let i = 0; i < req.files.length; ++i) {
      let file = req.files[i];
      
      let link = configs.CONTENTS_FOLDER + file.filename;

      const [result] = await client.labelDetection(file.path); // 이미지 정보를 분석
      const labels = result.labelAnnotations;

      const hiddenTagList = labels.filter(label => {  // 분석 결과 score(점수)가 SCORE_LIMIT 이상일 경우만 필터링
        if (label.score > configs.SCORE_LIMIT) {
          return true;
        }
        return false;
      }).map(label => { // 분석 결과의 설명 부분을 반환
        return label.description;
      });

      for (var j = 0; j < hiddenTagList.length; j++)
      { // 분석 결과를 dictinary 변수에 기록
        hiddenTagSet[hiddenTagList[i]] = 1;
      }

      let rotateFileLink = configs.CONTENTS_FOLDER + 'rotate_' + file.filename; // Exif orientation 정보에 따라 회전 후 저장될 이미지 파일 링크
      let filepath = file.path; // file의 경로

      if (i === 0)
      { // 첫 번째 파일일 경우 postImageLink와 postMarkerLink를 정해줌
        postImageLink = rotateFileLink;
        postMarkerLink = configs.CONTENTS_FOLDER + 'marker_' + file.filename;
      }
      

      fs.readFile(filepath, (err,data) => { // 파일을 읽어옴
        if (err) {
        console.log('Error reading file ' + fileIn + ' ' + err.toString());
        } else {
          sharp(data) // 읽어온 파일로 부터 Exif orientation을 통해 이미지 rotate후 rotateFileLink에 저장
          .rotate()
          .toFile( configs.ROOT_FOLDER + rotateFileLink, (err) => {
            if (err) {
              console.log('Error ' + configs.ROOT_FOLDER + rotateFileLink + ' ' + err.toString());
            } else {
              console.log('made ' + configs.ROOT_FOLDER + rotateFileLink);
              // 저장을 완료했을 경우 기존 파일은 삭제
              fs.unlink(filepath, (err) => { 
                  if (err) {
                    console.log('error deleting ' + filepath + ' ' + err.toString());
                  } else {
                    console.log('deleted ' + filepath);
                  }
                }
              );
            }});

          if (i === 0)
          { // 만약 첫 번째 파일일 경우 marker를 함께 만들어줌
            sharp(data).resize({width: 100, height: 100, fit: "fill"})
            .rotate() // Exif orientation을 통해 이미지 rotate후 postMarkerLink에 저장
            .toFile(configs.ROOT_FOLDER + postMarkerLink)
            
            .then( newFileInfo => {
              //console.log('Success!');
            })
            .catch( err => {
              //console.log(err);
              //console.log('Error occured!');
            })
          }
          else
          {
            console.log("??");
          }
        }
      });

      /*
      if (i === 0) // 게시물의 메인 이미지 링크를 0번째 이미지로 둠
      {
        postImageLink = link;
        postMarkerLink = configs.CONTENTS_FOLDER + 'marker_' + file.filename;
        console.log(req.files[0].path);

        sharp(file.path).resize({width: 100, height: 100, fit: "fill"}).toFile(configs.ROOT_FOLDER + postMarkerLink)
        .then( newFileInfo => {
          console.log('Success!');
        })
        .catch( err => {
          console.log('Error occured!');
        })
      }
      */

      let mime = file.mimetype;
      console.log(mime);
      if (!utils.isImage(mime))
      { // file의 mime 타입이 이미지가 아닌 경우 잘못된 파일!
        isWrong = true;
        break;
      }

      fileSize += file.size;
      if (fileSize > configs.FILE_LIMIT)
      { // 파일 사이즈가 FILE_LIMIT가 클 경우 db에 넣을 수 없도록 함
        isWrong = true;
        break;
      }

      contentsIDList.push(new mongoose.Types.ObjectId());
      console.log(contentsIDList);

      let contentsInfo = {
        _id: contentsIDList[i],
        link: rotateFileLink,
        contentsType: 0
      };

      //console.log(contentsInfo);

      contentsInfoList.push(contentsInfo);
    }
  }

  if (isWrong) {
    for (var i = 0; i < req.files.length; ++i) {
      let file = req.files[0];
      fs.unlink(file.path, (err) => {
        console.log('delete done');
      });
    }

    return res.status(409).json({
      message: 'wrong data!'
    });
  }

  let postInfo = {};

  postInfo.postWriterID = memberID;
  postInfo.postContents = postContents;
  postInfo.contentsList = contentsIDList;
  postInfo.tagList = tagList;
  postInfo.postImageLink = postImageLink;
  postInfo.postMarkerLink = postMarkerLink;
  postInfo.geo = [lat, lng];
  postInfo.hiddenTagList = Object.keys(hiddenTagSet);
  postInfo.postTitle = title;
  
  /*
  return res.json({
    message:"test"
  });
  */
  
  const transaction = new Transaction();
  try {
    for (var i = 0; i < contentsInfoList.length; ++i) {
      transaction.insert('Contents', contentsInfoList[i]);
    }

    const postID = transaction.insert('Post', postInfo);

    const final = await transaction.run()

    console.log('success posting!');
    return res.json({
      message: postID,
      hiddenTagList: Object.keys(hiddenTagSet)
    });

  } catch(err) {
    console.log('error occured!');

    for (var i = 0; i < req.files.length; ++i) { // DB에 등록도중 에러가 발생할 경우 모든 파일을 지움
      let file = req.files[i];
      fs.unlink(file.path, (err) => {
        console.log('delete done');
      });
    }

    await transaction.rollback().catch(console.error)
    transaction.clean();

    return res.status(409).json({
      message: 'error occured!'
    });
  }
  
}

/*
    GET /api/board/post
*/
exports.findPostByQuery = async (req, res) => {
  let query = req.query;

  // respond the token
  const respond = (post) => {
    post.reverse();

    res.json({
        message: 'successfully load post',
        post
    })
  }

  // error occured
  const onError = (error) => {
    res.status(403).json({
        message: error.message
    })
  }

  Post.findPostByQuery({})
  .then(respond)
  .catch(onError);

 /*
 Post.find(function(err, posts){
  if(err) return res.status(500).send({error: 'database failure'});
  res.json(posts);
})
*/
}

/*
    GET /api/board/me/followingspost
*/
exports.findFollowingsPost = async (req, res) => {
  let member_id = req.decoded._id;
  let myfollow;
  //console.log("AAA");
  //console.log(member_id);

  const findpost = (followingList) => {
    myfollow = followingList;
    //console.log(followingList);

    const followingIDList = followingList.map( following => {
      return following.followingMemberID._id;
    });
    console.log(followingIDList);

    return Post.find({postWriterID: {"$in" : followingIDList}}).populate('contentsList').limit(30).sort({"postDate":-1});
  }

  // respond the token
  const respond = (post) => {
    res.json({
        message: 'successfully load post',
        post,
        myfollow,
    })
  }

  // error occured
  const onError = (error) => {
    console.log(error);
    res.status(403).json({
        message: error.message
    })
  }

  Following.findFollowingByMemberID(member_id)
  .then(findpost)
  .then(respond)
  .catch(onError);

 /*
 Post.find(function(err, posts){
  if(err) return res.status(500).send({error: 'database failure'});
  res.json(posts);
})
*/
}

/*
    GET /api/board/post/:member_id
*/
exports.findPostByMemberID = async (req, res) => {
  let member_id = req.params.member_id;

  let page = req.query.page;

  if (page < 0)
    page = 0;
  else
    page = page - 1;

  // respond the token
  const extract = (postList) => {
    let tagSet = {};
    for (var i = 0; i < postList.length; i++)
    {
      for (var j = 0; j < postList[i].tagList.length; j++)
      {
        tagSet[postList[i].tagList[j]] = postList[i].postMarkerLink;
      }
    }

    return {postList, tagSet};
  }

  const respond = (postInfo) => {
    res.json({
        message: 'successfully load post',
        postInfo
    })
  }

  // error occured
  const onError = (error) => {
    res.status(403).json({
        message: error.message
    })
  }

  Post.find({postWriterID: member_id})
  .populate({path:'contentsList postWriterID', select:'link contentsType nickname profileLink'})
  .sort({postDate: -1})
  .skip(page * configs.POSTS_PER_PAGE)
  .limit(configs.POSTS_PER_PAGE)
  .then(extract)
  .then(respond)
  .catch(onError);

 /*
 Post.find(function(err, posts){
  if(err) return res.status(500).send({error: 'database failure'});
  res.json(posts);
})
*/
}


/*
    GET /api/board/me
*/
exports.me = async (req, res) => {
  let member_id = req.decoded._id;

  let page = req.query.page;

  if (page < 0)
    page = 0;
  else
    page = page - 1;

  // respond the token
  const extract = (postList) => {
    let tagSet = {};
    for (var i = 0; i < postList.length; i++)
    {
      for (var j = 0; j < postList[i].tagList.length; j++)
      {
        tagSet[postList[i].tagList[j]] = postList[i].postMarkerLink;
      }
    }

    return {postList, tagSet};
  }

  const respond = (postInfo) => {
    res.json({
        message: 'successfully load post',
        postInfo
    })
  }

  // error occured
  const onError = (error) => {
    res.status(403).json({
        message: error.message
    })
  }

  Post.find({postWriterID: member_id})
  .populate({path:'contentsList postWriterID', select:'link contentsType nickname profileLink'})
  .sort({postDate: -1})
  .skip(page * configs.POSTS_PER_PAGE)
  .limit(configs.POSTS_PER_PAGE)
  .then(extract)
  .then(respond)
  .catch(onError);

 /*
 Post.find(function(err, posts){
  if(err) return res.status(500).send({error: 'database failure'});
  res.json(posts);
})
*/
}

/*
    POST /api/board/post/like/:post_id
    {
    }
*/
exports.like = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;
  let condition = -1;
  let interest = null;
  let postInfo = null;

  const create = (liking) => {
    if(utils.isEmpty(liking)){
      //like
      let like_instance = new Liking({
          memberID:mongoose.Types.ObjectId(user_id),
          likingPostID:mongoose.Types.ObjectId(post_id)
        });
      like_instance.save();
      condition = 1;
    }else{
      //unlike
      Liking.deleteOne({memberID:mongoose.Types.ObjectId(user_id), likingPostID:mongoose.Types.ObjectId(post_id)}, function(err){
          if(err) throw 'database failure';
      });
      condition = 2;
    }
  }

  const update = (post) => {
    postInfo = post;

    if(condition === 1){
      //increase
      post.numOfLikes = post.numOfLikes + 1;
      post.save()
      .then( (post) => {
      //return post;
      })
      .catch((err) => {
        console.log(err);
        //return null;
      });
    }else if(condition === 2){
      //decrease
      post.numOfLikes = post.numOfLikes - 1;
      post.save()
      .then( (post) => {
      //return post;
      })
      .catch((err) => {
        console.log(err);
        //return null;
      });
    }

    return Interest.findOne({interestMemberID: user_id})
  }

  const calculate = (interest) => {
    console.log('in calculate');
    console.log(interest);
    if (utils.isEmpty(interest)) {
      var interesting = {};
      if (!utils.isEmpty(postInfo.hiddenTagList)) {
        postInfo.hiddenTagList.forEach((item, index, arr) => {
          interesting[item] = 1;
        });
      }

      let newInterest = new Interest({
        interestMemberID:mongoose.Types.ObjectId(user_id),
        interesting: interesting
      });

      newInterest.save();
    }
    else {
      console.log('condition:', condition);
      postInfo.hiddenTagList.forEach((item, index, arr) => {
        console.log(interest.interesting.get(item));
        var value = interest.interesting.get(item)
        if (utils.isEmpty(value)) {
          interest.interesting.set(item, 1);
        }
        else {
          if (condition === 1)
            interest.interesting.set(item, value + 1)
          else if (condition === 2)
            interest.interesting.set(item, value - 1)
        }
      });
      console.log(interest);
      interest.save();
    }
  }

  const respond = ()=>{
    res.json({
      message: 'done'
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    })
  }

  Liking.findOneLikingByQuery({"memberID": mongoose.Types.ObjectId(user_id), "likingPostID": mongoose.Types.ObjectId(post_id)})
  .then(create)
  .then(function(){
    return Post.findOnePostByQuery({"_id":mongoose.Types.ObjectId(post_id)});
  })
  .then(update)
  .then(calculate)
  .then(respond)
  .catch(onError)
}

/*
    POST /api/board/post/comment/:post_id
    {
      commentContents
    }
*/
exports.postcomment = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;

  //console.log(req.body);
  const { commentContents } = req.body;

  const create = (post) => {
    if(commentContents==undefined || commentContents.length>45){
      throw new Error('Wrong comment');
    }
    let comment_instance = new Comment({
      commentWriterID:mongoose.Types.ObjectId(user_id),
      commentContents:commentContents,
    });

    post.commentList.push(comment_instance._id);

    //console.log(post);
    //console.log(comment_instance);

    comment_instance.save();
    post.save();
    return Comment.populate(comment_instance, {path:'commentWriterID', select:'nickname profileLink'});

    //return Post.populate(post, {path: 'commentList', populate: {path: 'commentWriterID', select:{'nickname':1, 'profileLink':1}}});
  }

  const respond = (comment)=>{
    res.json({
      message: 'done',
      comment: comment
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    })
  }

  Post.findOnePostByQuery({_id: post_id})
  .then(create)
  .then(respond)
  .catch(onError);
}


/*
    GET /api/board/post/comment/:post_id
    {
      commentContents
    }
*/
exports.getcomment = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;

  //console.log(req.body);
  const { commentContents } = req.body;

  const create = (post) => {
    if (utils.isEmpty(post))
      throw "Can not found!";

    return post.commentList;
  }

  const respond = (commentList)=>{
    res.json({
      message: 'done',
      commentList: commentList
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    console.log(error);
    res.status(403).json({
      message: error
    })
  }

  Post.findPostCommentByQuery(post_id)
  .then(create)
  .then(respond)
  .catch(onError);
}


/*
    DELETE /api/board/post/:post_id
    {
      commentContents
    }
*/
exports.deletepost = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;

  const deletepost = (post) => {
    console.log("띠용");
    //post.commentList.push(comment_instance._id);

    //console.log(post);
    //console.log(comment_instance);
    console.log(user_id);
    console.log(post);
    if (post.postWriterID == user_id)
    {
      console.log("???");
      post.remove(function (err, post) {
        if(err) {
          console.log('읭?');
          console.log(err);
          throw err;
        }
        else {
          console.log('와웅');
          res.status(204).end();
        }
      });
    }
    else
    {
      throw "Can't not Delete!"
    }
    //post.save();
  }

  const respond = ()=>{
    res.json({
      message: 'done'
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    });
  }

  Post.findById(post_id)
  .then(deletepost)
  .then(respond)
  .catch(onError);
}

/**
    GET /board?tag={tag}&page={page}
 */
exports.searchtag = (req, res) => {
  let { postContents, tagList } = req.body;
  let tag = req.query.tag;
  let page = req.query.page;
  let params = null;

  if (utils.isEmpty(tag))
    params = {};
  else
    params = {"tagList": {"$regex": tag, "$options": "i"}};

  if (page < 0)
    page = 0;
  else
    page = page - 1;

  const respond = (post)=>{
    res.json({
      message: 'done',
      post
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    });
  }
  // {path: 'commentList', populate: {path: 'commentWriterID', select:{'nickname':1, 'profileLink':1}}}
  Post.find(params)
  //.populate('contentsList postWriterID')
  .populate('contentsList')
  .populate({path: 'postWriterID', select:{'nickname':1, 'profileLink':1}})
  .sort({postDate: -1})
  .skip(page * configs.POSTS_PER_PAGE)
  .limit(configs.POSTS_PER_PAGE)
  .then(respond)
  .catch(onError);
}

/*
    GET /api/board/detail/:post_id
*/
exports.detailpost = (req, res) =>{
  let post_id = req.params.post_id;
  let member_id = null;
  if (!utils.isEmpty(req.decoded)) {
    member_id = req.decoded._id;
  }
  let profileLink = null;
  let nickname = null;
  let isFollowing = false;
  let isLiked = false;

  const update = (post) => {
    //post.commentList.push(comment_instance._id);

    //console.log(post);
    //console.log(comment_instance);
    post.numOfViews = post.numOfViews + 1;
    post.save().then( post => {}).catch( err => {console.log(err)});

    //post.save();
    profileLink = post.postWriterID.profileLink;
    nickname = post.postWriterID.nickname;

    return post.postWriterID;
  }

  const checkfollowing = (postWriterID) => {
    return Following.findOne({memberID: member_id,  followingMemberID: postWriterID})
  }

  const checkliking = (following) => {
    if (!utils.isEmpty(following)) {
      isFollowing = true;
    }
    return Liking.findOne({memberID: member_id, likingPostID: post_id})
  }

  const respond = (liking)=>{
    if (!utils.isEmpty(liking))
      isLiked = true;

    res.json({
      message: 'done',
      isLiked,
      isFollowing,
      profileLink,
      nickname,
    });
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    });
  }

  Post.findById(post_id)
  .populate('postWriterID', 'profileLink nickname')
  .then(update)
  .then(checkfollowing)
  .then(checkliking)
  .then(respond)
  .catch(onError);
}

/*
    GET /api/board/hot
*/
exports.hot = async (req, res) => {
  let i=0
  let tag = ['음악', '여행', '음식', '쇼핑', '동물', '힐링', '일상']
  let allPost= {}
  let postPerTag = configs.HOT_POST_N / tag.length;

  while(i<tag.length){
    let hotTagPost = await Post.findLimitPostByQuery({"tagList": tag[i]}, postPerTag)
    allPost[tag[i]] = hotTagPost
    i = i+1;
  }
  res.json(allPost)
}

/*
    GET /api/board/recommendedPost
*/

exports.findRecommendedPost = async (req, res) => {
  console.log("읭?");
  var hrstart = process.hrtime()
  var member_id = req.decoded._id;

  let likingPostList = await Liking.find({memberID:member_id}, {likingPostID:true}).populate('likingPostID');

  let i =0
  let j =0
  let tagList = []

  while(i<likingPostList.length){
    let likingPost = likingPostList[i].likingPostID;

    j=0

    if (!utils.isEmpty(likingPost) && !utils.isEmpty(likingPost.hiddenTagList)) {
      while(j<likingPost.hiddenTagList.length){
        if(!tagList.some(c => c.name === likingPost.hiddenTagList[j])){
          tagList.push({name:likingPost.hiddenTagList[j], cnt:1})
        }else{
          let result = tagList.find(c => c.name === likingPost.hiddenTagList[j]);
          let pos = tagList.indexOf(result);
          result.cnt = result.cnt + 1;
          tagList[pos] = result;
        }
        j = j + 1
      }
    }
    i = i + 1
  }

  tagList.sort(function(a,b){
    if(a.cnt>b.cnt){
      return -1
    }
    else if(a.cnt < b.cnt){
      return 1
    }
    else
      return 0
  })


  i = 0


  let recommendPost = {}
  var postPerTag = configs.RECOMMEND_POST_N / configs.RECOMMEND_TOP_N;

  while(i < configs.RECOMMEND_TOP_N){
    let post = await Post.findLimitPostByQuery({"hiddenTagList":tagList[i].name}, postPerTag)
    //console.log(post)
    recommendPost[tagList[i].name] = post
    i = i + 1
  }

  /*
  i = 0
  recommendPost = []

  while(i < 5) { // 사용자가 추천한 글의 상위 5개의 히든 태그를 가진 글을 추천해줌
    let post = await Post.findLimitPostByQuery({"hiddenTagList":tagList[i].name})
    console.log(post);
    recommendPost = recommendPost.concat(post);
    i = i + 1
  }
  */
  res.json(recommendPost)

  var hrend = process.hrtime(hrstart)
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}


/*
    GET /api/board/recommendedPostHard
*/

exports.findRecommendedPostHard = async (req, res) => {
 var hrstart = process.hrtime()

 let member_id = req.decoded._id;
 let memberLikedTag = {}; // 회원이 좋아요 한 글의 태그 별 개수
 let count = 0;

 // 로그인한 회원의 추천 목록을 가져와 가장 최근에 저장된 순으로 나열하기 위해 reverse를 해줌
 let liking = await Liking.find({memberID:member_id}, {likingPostID:true}).populate('likingPostID'); 
 liking.reverse();

 // i가 liking 배열의 길이 혹은 CHECK_POST 보다 클 경우 반복문 종료 
 for (var i = 0; i < liking.length && i < configs.CHECK_POST; i++) {
   const post = liking[i].likingPostID;
   
   if (utils.isEmpty(post) || utils.isEmpty(post.hiddenTagList))
    continue;

   post.hiddenTagList.forEach(function(item, index, array) {
    if (item in memberLikedTag)
      memberLikedTag[item] += 1;
    else
      memberLikedTag[item] = 1;
   });
 }

 let memberCount = await Member.count({});
 let simList = [];

 // 특정 멤버 개수 만큼 반복 및 랜덤 하게 회원을 선택
 //for (var i = 0; i < configs.CHECK_MEMBER; i++) {
 //   var random = Math.floor(Math.random() * memberCount)
 //   var member = await Member.findOne().skip(random);

 for (var i = 0; i < memberCount; i++) { // 테스트용 코드
    var member = await Member.findOne().skip(i); // i번째로 등록된 멤버를 불러옴
    var otherLikedTag = {};

    /*
    // 회원 정보도 함께 반환
    var likedPost = await ( Liking.find({memberID:member._id}, {likingPostID:true}) // 불러온 회원이 추천한 게시물 목록을 받아옴
    .populate({path: 'likingPostID', populate:{path: 'contentsList postWriterID', select:{link:1, contentsType:1, nickname: 1, profileLink: 1}}})
    );
    */

   var likedPost = await ( Liking.find({memberID:member._id}, {likingPostID:true}) // 불러온 회원이 추천한 게시물 목록을 받아옴
   .populate({path: 'likingPostID', populate:{path: 'contentsList'}})
   );
   
    if (likedPost.length === 0) // 추천한 게시물이 없을 경우 넘어감
      continue;

    likedPost.reverse(); // 가장 최근에 저장된 순으로 나열하기 위해 reverse를 해줌

    var postList = [];

    for (var j = 0; j < likedPost.length && j < configs.CHECK_POST; j++) { // i가 liking 배열의 길이 혹은 CHECK_POST 보다 클 경우 반복문 종료 
      const post = likedPost[j].likingPostID;
      
      if (utils.isEmpty(post) || utils.isEmpty(post.hiddenTagList))
        continue;

      postList.push(post); // 포스트 정보를 postList 변수에 넣어줌

      post.hiddenTagList.forEach(function(item, index, array) {
       if (item in otherLikedTag)
        otherLikedTag[item] += 1;
       else
        otherLikedTag[item] = 1;
      });
    }

    var sim = utils.cosinesimRatioUsingObject(memberLikedTag, otherLikedTag); // 로그인 한 회원과 i번째 멤버 간의 코사인 유사도를 계산

    // 코사인 유사도가 1보다 작을 경우 simList에 코사인 유사도, 게시물 목록 정보를 넣어줌, 코사인 유사도가 1일 경우에는 로그인한 회원과 i번째 회원 모두 추천을 하지 않은 경우
    // 혹은 모든 태그 별 개수가 같을 경우 (자기 자신이거나, 아주 우연히 같은 경우)
    if (sim < 1) 
      simList.push({sim, postList});
 }

 simList.sort( function(a, b) { // 유사도를 기준으로 내림차순 정렬
   return b.sim - a.sim;
 });

 let check = {}; // 중복된 게시물을 체크하기 위한 변수

 var recommendPost = [];
 for (var i = 0; i < simList.length && i < configs.RECOMMEND_SIM_N; i++) { // 가장 유샤한 TOP N명의 회원 정보를 봄.
   var postList = simList[i].postList;
   postList = postList.filter(function(item, index, array) { // 중복된 게시물을 걸러냄
    if (item._id in check) // 해당 아이템이 이미 추천 게시물 목록에 있을 경우(check변수에 post 식별자가 있을 경우) 제외 시킴
      return false;
    else { // 중복된 게시물이 없을 경우 check 변수에 post 식별자를 추가해준다.
      check[item._id] = true;
      return true;
    }
   });

   recommendPost = recommendPost.concat(postList); // 중복된 게시물을 걸러낸 목록을 추천 게시물 목록에 추가함
 }

 newRecommendPost = recommendPost.slice(0, configs.RECOMMEND_POST_N) // 추천할 게시물 개수 만큼 잘라냄
 //console.log(newRecommendPost);

  res.json({
    message:'done',
    newRecommendPost
  })

  var hrend = process.hrtime(hrstart)
  console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}

/*
    GET /api/board/recommendedPostHardNew
*/

exports.findRecommendedPostHardNew = async (req, res) => {
  let member_id = req.decoded._id;
  let memberInterestObj = new Map();

  let interest = await Interest.findOne({interestMemberID:member_id});
  if (!utils.isEmpty(interest))
    memberInterestObj = interest.interesting;

  let simList = [];

  let interestList = await Interest.find({});
  let memberCount = interestList.length;

  let id = null;

  for (var i = 0; i < memberCount; i++) {
    var otherInterest = interestList[i];
    
    id = otherInterest.interestMemberID;
    
    if (id == member_id)
      continue;
    
    var otherInterestObj = otherInterest.interesting;

    // 로그인 한 회원과 i번째 멤버 간의 코사인 유사도를 계산
    var sim = utils.cosinesimRatioUsingMap(memberInterestObj, otherInterestObj); 
    
    simList.push({sim, id});
  }

  simList.sort( function(a, b) { // 유사도를 기준으로 내림차순 정렬
    return b.sim - a.sim;
  });
  
  let check = {}; // 중복된 게시물을 체크하기 위한 변수
  var recommendPost = [];

  var recommendationPerUser = configs.RECOMMEND_POST_N / configs.RECOMMEND_SIM_N;
  var countSim = 0;

  for (var i = 0; i < simList.length && countSim < configs.RECOMMEND_SIM_N; i++) { // 가장 유샤한 TOP N명의 회원 정보를 봄.
    id = simList[i].id;

    var likingList = await ( Liking.find({memberID:id}, {likingPostID:true}) // 불러온 회원이 추천한 게시물 목록을 받아옴
    .populate({path: 'likingPostID', populate:{path: 'contentsList'}})
    );

    if (likingList.length <= 0)
      continue;

    likingList.reverse();

    countSim += 1;

    var postList = [];
    likingList.forEach( (item, index, arr) => {
      postList.push(item.likingPostID);
    });

    postList = postList.filter(function(item, index, array) { // 중복된 게시물을 걸러냄
     if (item === null) {
      return false;
     }
     else if (item._id in check) { // 해당 아이템이 이미 추천 게시물 목록에 있을 경우(check변수에 post 식별자가 있을 경우) 제외 시킴
       return false;
     }
     else { // 중복된 게시물이 없을 경우 check 변수에 post 식별자를 추가해준다.
       check[item._id] = true;
       return true;
     }
    });

    postList = postList.slice(0, recommendationPerUser);

    recommendPost = recommendPost.concat(postList); // 중복된 게시물을 걸러낸 목록을 추천 게시물 목록에 추가함

    if (recommendPost.length > configs.RECOMMEND_POST_N)
      break;
  }
 
  var recommendObj = new Map();
  newRecommendPost = recommendPost.slice(0, configs.RECOMMEND_POST_N) // 추천할 게시물 개수 만큼 잘라냄
  newRecommendPost.forEach((item, index, arr) => {
    item.hiddenTagList.forEach((tag, index, arr) => {
      recommendObj.set(tag, true);
    });
  });

  var acc = utils.calculateAccuracy(memberInterestObj, recommendObj);
  var recall = utils.calculateRecall(memberInterestObj, recommendObj);
 
   res.json({
     message:'done',
     acc,
     recall,
     newRecommendPost,
   })
 }

/*
    GET /api/board/recommendedPostEasy
*/

exports.findRecommendedPostEasy = async (req, res) => {
  var hrstart = process.hrtime()

 var member_id = req.decoded._id;
 var memberLikedTag = {}; // 회원이 좋아요 한 글의 태그 별 개수
 var count = 0;

 // 로그인한 회원의 추천 목록을 가져와 가장 최근에 저장된 순으로 나열하기 위해 reverse를 해줌
 //var liking = await Liking.find({memberID:member_id}, {likingPostID:true}).populate('likingPostID');
 //liking.reverse();
 let interest = await Interest.findOne({interestMemberID:member_id});
 if (!utils.isEmpty(interest))
   memberInterestObj = interest.interesting;
 else
   memberInterestObj = new Map();

 // 중복된 게시물을 체크하기 위한 변수
 let check = {};
 let finalCheck = {};

 // i가 liking 배열의 길이 혹은 CHECK_POST 보다 클 경우 반복문 종료 
 /*
 for (var i = 0; i < liking.length && i < configs.CHECK_POST; i++) {
   const post = liking[i].likingPostID;
   
   if (utils.isEmpty(post) || utils.isEmpty(post.hiddenTagList))
    continue;

   post.hiddenTagList.forEach(function(item, index, array) {
    if (item in memberLikedTag)
      memberLikedTag[item] += 1;
    else
      memberLikedTag[item] = 1;
   });
 }
 */

 var memberLikedTagList = [];
 var totalCount = 0;

 // Object형태의 변수를 리스트 형식으로 변환함. ex) {'강아지':3, '고양이':2} => [{count: 3, key:'강아지'}, {count:2, key:'고양이'}]
 for (var [key, value] of memberInterestObj) {
   //var count = memberLikedTag[key];
   memberLikedTagList.push({key, value});
   totalCount += value;
 } 

 // 각 태그가 등장하는 개수 비율에 RECOMMEND_POST_N를 곱하여 각 태그별 추천할 글 개수를 정함.
 // ex) [{count: 1, key:'강아지'}, {count:1, key:'고양이'}], RECOMMEND_POST_N=10 => 강아지 태그를 가진 글 5개, 고양이 태그를 가진 글 5개 글을 추천해주도록 함
 // RECOMMEND_POST_N: 추천할 게시물 개수
 var length = memberLikedTagList.length
 for (var i = 0; i < length; i++) {
   memberLikedTagList[i].recommendationN = (memberLikedTagList[i].count / totalCount) * configs.RECOMMEND_POST_N;
 }

 //console.log(memberLikedTagList);

 var totalPost = 0;
 var recommendPost = [];
 var restPostList = [];

 // i가 태그 종류 개수 보다 클 경우  혹은 totalPost가 RECOMMEND_POST_N보다 클 경우 반복문 종류
 for (var i = 0; i < length && totalPost < configs.RECOMMEND_POST_N; i++) {
   var recommendationN = memberLikedTagList[i].recommendationN;
   var postPerTag = recommendationN <= 1 ? 1 : recommendationN; // 만약 recommendationN이 1보다 작을 경우 해당 태그에서 최소 1개를 추천하도록 함

   if (totalPost + postPerTag >= configs.RECOMMEND_POST_N)
   { // 현재 까지 추천한 포스트 개수 + 이번에 새로 추천할 포스트 개수가 최대 추천 게시물 보다 클 경우 
    postPerTag = configs.RECOMMEND_POST_N - totalPost; // 해당 태그 추천 게시물 + totalPost = RECOMMEND_POST_N이 되도록 함
   }

   var tag = memberLikedTagList[i].key;

   var post = await Post.findPostByQueryTotal({"hiddenTagList":tag}) // tag를 가진 게시물 목록을 최대한 불러옴
   
   post = post.filter(function(item, index, array) { // 중복된 게시물을 걸러냄
    if (item._id in check) // 해당 아이템이 이미 추천 게시물 목록에 있을 경우 제외 시킴
      return false;
    else {
      check[item._id] = true;
      return true;
    }
   });
   
   var newPost = post.slice(0, recommendationN);
   restPostList.push(post.slice(recommendationN));

   newPost.forEach((item, index, arr) => {
    finalCheck[item._id] = true;
   });

   if (post.length > 0)
    recommendPost = recommendPost.concat(newPost); 

   postPerTag = newPost.length; // 중복된 게시물을 제거하고 남은 게시물 개수를 postPerTag에 저장함
   totalPost += postPerTag; // totalPost에 postPerTag를 더해줌. 즉, 추천된 게시물 개수를 증가 시킴
 }

 for (var i = 0; i < length && totalPost < configs.RECOMMEND_POST_N; i++) {
  var postPerTag = configs.RECOMMEND_POST_N - totalPost;
  //console.log(postPerTag);

  var tag = memberLikedTagList[i].key;

  var post = restPostList[i];
  //console.log(post.length);
  post = post.slice(0, postPerTag)
  recommendPost = recommendPost.concat(post); 

  postPerTag = post.length; // 중복된 게시물을 제거하고 남은 게시물 개수를 postPerTag에 저장함
  totalPost += postPerTag; // totalPost에 postPerTag를 더해줌. 즉, 추천된 게시물 개수를 증가 시킴
 }

 //console.log(recommendPost);

 newRecommendPost = recommendPost.slice(0, configs.RECOMMEND_POST_N) // 추천할 게시물 개수 만큼 잘라냄

 res.json({
  message:'done',
  newRecommendPost,
 });

 var hrend = process.hrtime(hrstart)

 console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
}

/*
    DELETE /api/board/post/comment/:post_id/:comment_id
*/
exports.deletecomment = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;
  let comment_id = req.params.comment_id;

  const deletepost = (post) => {
    console.log("끙쓰");
    //post.commentList.push(comment_instance._id);

    //console.log(post);
    //console.log(comment_instance);
    //console.log(post);
    
    var commentList = post.commentList;

    //console.log(commentList.length);
    console.log(commentList.length);

    var newCommentList = commentList.filter((item, index, arr) => {
      console.log(item);
      if (item._id == comment_id && item.commentWriterID == user_id)
        return false;
      else 
        return true;
    });

    console.log(comment_id);
    console.log(user_id);

    if (commentList.length === newCommentList.length)
    {
      throw "can't deleted!!"
    }

    post.commentList.pull(comment_id) // mongoose에서 알아서 지워주는것 같음.
    post.save();

    return Comment.findByIdAndDelete(comment_id, (err, res) => {
      if (err) {
        console.log(err);
        throw "comment can't deleted!!"
      }
      else {
        console.log('comment deleted!'); // throw시 서버가 크래쉬됨
      }
    });
  }

  const respond = ()=>{
    res.json({
      message: 'done'
    })
  }

  const onError = (error)=>{
    console.log(error);
    res.status(403).json({
      message: error
    });
  }

  Post.findById(post_id)
  .populate('commentList')
  .then(deletepost)
  .then(respond)
  .catch(onError);
}

/*
    POST /api/board/post/like/:post_id
    {
    }
*/
exports.mergelike = (req, res) =>{
  let user_id = req.decoded._id;
  let post_id = req.params.post_id;
  let condition = -1;
  let interest = null;
  let postInfo = null;
  let newInteresting = new Map();
  

  const calculate = (interestList) => {
    //console.log(interestList);
    
    console.log(user_id);

    interestList.forEach((item, index, arr) => {
      for (var [key, value] of item.interesting) {
        if (newInteresting.has(key)) {
          newInteresting.set(key, newInteresting.get(key) + value)
        }
        else {
          newInteresting.set(key, value)
        }
      }
    });

    console.log(newInteresting)
    return Interest.remove({interestMemberID: user_id})
  }

  const create = (interestList) => {
    //console.log(interestList);

    let newInterest = new Interest({
      interestMemberID:mongoose.Types.ObjectId(user_id),
      interesting: newInteresting
    });

    newInterest.save();
  }

  const respond = ()=>{
    res.json({
      message: 'done'
    })
  }

  const onError = (error)=>{
    console.log(error.message);
    res.status(403).json({
      message: error.message
    })
  }

  Interest.find({interestMemberID: user_id})
  .then(calculate)
  .then(create)
  .then(respond)
  .catch(onError)
}
