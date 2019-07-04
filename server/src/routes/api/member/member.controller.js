const Member = require ('../../../models/Member')
const Following = require ('../../../models/Following')
const Followers = require ('../../../models/Followers')
const Post = require ('../../../models/Post')

const utils = require('../../../common/utils');
const configs = require('../../../common/configs');

const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');

/*
    GET /api/member/list
*/

exports.list = (req, res) => {
    Member.find({})
    .select('nickname profileLink email userid')
    .then(
        members=> {
            res.json({members})
        }
    )

}

/*
    POST /api/member/assign-admin/:email
*/

/*
exports.assignAdmin = (req, res) => {
    // refuse if not an admin
    if(!req.decoded.admin) {
        return res.status(403).json({
            message: 'you are not an admin'
        })
    }

    Member.findOneByUserID(req.params.userid)
    .then(
        member => member.assignAdmin
    ).then(
        res.json({
            success: true
        })
    )
}
*/

/*
    GET /api/member/me
*/
exports.me = (req, res) => {
  let member_id = req.decoded._id;

  let memberProfile = null;
  let numOfFollowers = 0;
  let numOfPosts = 0;
  let isFollowed = false;
  let me = true;


  const countfollowing = (member) => { // member_id를 구독한 사람 수
    if (!utils.isEmpty(member)) {
      //res.status(204).end();
    }
    else {
      throw "Can not find Member!";
    }

    memberProfile = member;
    //console.log("뀨뀨꺄꺄");
    //console.log(member);
    return Followers.countDocuments({memberID: member_id});
  }

  const countpost = (num) => { // member_id가 작성한 게시물 수
    //console.log(num);
    numOfFollowers = num;

    return Post.countDocuments({postWriterID: member_id});
  }

  // respond the token
  const respond = (num) => {
    numOfPosts = num;

    //console.log(isFollowed);

    res.json({
      message: 'successfully load member',
      memberProfile,
      numOfFollowers,
      numOfPosts,
      isFollowed,
      me,
    })
  }

  // error occured
  const onError = (error) => {
    console.log(error);
    res.status(403).json({
      message: error.message
    })
  }

  Member.findById(member_id, 'nickname profileLink')
  .then(countfollowing)
  .then(countpost)
  .then(respond)
  .catch(onError);
}
/*
    UPDATE /api/member/me
    {
        profile : 프로파일 사진
        nickname : 닉네임
    }
*/

exports.updateme = (req, res) => {
    let id = req.decoded._id;
    let { nickname, rotation } = req.body;
    let newProfileLink = null;
    let originProfileLink;
    let updatedProfileLink = null;
    let updatedNickname = null;
    console.log('각도:');
    console.log(rotation);
    const update = (member) => {
        if (!utils.isEmpty(req.file) && utils.isImage(req.file.mimetype)) {
            let filepath = req.file.path;
            //filepath = utils.replaceAll(filepath, '\\', '/');
            //console.log(filepath);

            newProfileLink = configs.PROFILE_FOLDER + 'profile_' + req.file.filename;
            originProfileLink = member.profileLink;
            console.log(configs.ROOT_FOLDER + newProfileLink);

            // filepath에 있는 이미지를 불러와 이미지 리사이징 후 원본 이미지 삭제
            fs.readFile(filepath, (err,data) => {
              if (err) {
                console.log('Error reading file ' + fileIn + ' ' + err.toString());
              } else {
                sharp(data)
                .rotate()
                .resize({width: 100, height: 100, fit: "fill"})
                .toFile(configs.ROOT_FOLDER + newProfileLink, (err) => {
                  if (err) {
                    console.log('Error ' + configs.ROOT_FOLDER + newProfileLink + ' ' + err.toString());
                  } else {
                    console.log('made ' + configs.ROOT_FOLDER + newProfileLink);

                    fs.unlink(filepath, (err) => {
                      if (err) {
                        console.log('error deleting ' + filepath + ' ' + err.toString());
                      } else {
                        console.log('deleted ' + filepath);
                      }
                    });


                    if (originProfileLink != configs.BASIC_PROFILE)
                    {  // 이전 프로필 사진이 기본 프로필 사진이 아닐 경우 이전 프로필 사진을 지워준다.
                        fs.unlink(configs.ROOT_FOLDER + originProfileLink, (err) => {
                            if (err) {
                              console.log('error deleting ' + filepath + ' ' + err.toString());
                            } else {
                              console.log('deleted ' + filepath);
                            }
                        });
                    }
                  }
                });
              }
            });
        }

        console.log(nickname);
        console.log(newProfileLink);

        if (!utils.isEmpty(nickname))
            member.nickname = nickname;
        updatedNickname = member.nickname;

        if (!utils.isEmpty(newProfileLink))
            member.profileLink = newProfileLink;
        updatedProfileLink = member.profileLink;

        member.save()
        .then( member => {
            //res.status(204).end();
            //return member;
        })
        .catch( err => {
            console.log(err);
            throw err;
        });
    }
    // respond the token
    const respond = (member) => {
      res.json({
        message: 'successfully update member',
        nickname: updatedNickname,
        profileLink: updatedProfileLink,
      })
    }

    // error occured
    const onError = (error) => {
      res.status(403).json({
        message: error.message
      })
    }

    Member.findById(id)
    .then(update)
    .then(respond)
    .catch(onError);
  }

/*
    GET /api/member/:member_id
*/
exports.findByID = (req, res) => {
    //let id = req.decoded._id;
    let member_id = req.params.member_id;

    let memberProfile = null;
    let numOfFollowers = 0;
    let numOfPosts = 0;
    let isFollowed = false;
    let me = false;

    let login_member_id = null;
    //console.log(req.decoded);
    //console.log("RDSAFDAS");
    //console.log(utils.isEmpty(req.decoded));

    if (!utils.isEmpty(req.decoded)) {
      //console.log(member_id);
      //console.log(req.decoded._id);

      login_member_id = req.decoded._id;
      if (login_member_id === member_id) me = true;
      //console.log("읭??");
    }


    const countfollowing = (member) => { // member_id를 구독한 사람 수
      if (!utils.isEmpty(member)) {
        //res.status(204).end();
      }
      else {
        throw "Can not find Member!";
      }

      memberProfile = member;
      //console.log("뀨뀨꺄꺄");
      //console.log(member);
      return Followers.find({memberID: member_id}).countDocuments();
    }

    const countpost = (num) => { // member_id가 작성한 게시물 수
      //console.log(num);
      numOfFollowers = num;

      return Post.find({postWriterID: member_id}).countDocuments();
    }

    const confirm = (num) => { // 구독 여부 확인
      //console.log(num);
      numOfPosts = num;

      if (login_member_id === null)
        return null;
      else
        return Following.findOne({memberID: login_member_id, followingMemberID: member_id})
    }

    // respond the token
    const respond = (following) => {
      if (!utils.isEmpty(following)) {
        isFollowed = true;
      }


      //console.log(isFollowed);
      //console.log(me);

      res.json({
        message: 'successfully load member',
        memberProfile,
        numOfFollowers,
        numOfPosts,
        isFollowed,
        me,
      })
    }

    // error occured
    const onError = (error) => {
      //console.log(error);
      res.status(403).json({
        message: error.message
      })
    }

    Member.findById(member_id, 'nickname profileLink')
    .then(countfollowing)
    .then(countpost)
    .then(confirm)
    .then(respond)
    .catch(onError);
  }

/*
    POST /api/member/follow/:member_id
*/
  exports.follow = async (req, res) => {
    //console.log("???!!!");
    let user_id = req.decoded._id;
    let following_user_id = req.params.member_id;
    let condition = -1;

    //console.log(user_id);
    //console.log(following_user_id);
    if (user_id === following_user_id) {
        //console.log("뀨뀨꺄꺄");
        return res.status(409).json({error: 'same member!'});
    }

    const create = (following) => {
      //console.log(following);
      if(utils.isEmpty(following)){
        //like
        let following_instance = new Following({
            memberID:mongoose.Types.ObjectId(user_id),
            followingMemberID:mongoose.Types.ObjectId(following_user_id)
          });

        let followers_instance = new Followers({
            memberID:mongoose.Types.ObjectId(following_user_id),
            followersID:mongoose.Types.ObjectId(user_id)
        });

        following_instance.save()
        .then( following => {
            console.log(following);
        })
        .catch( err => {
            console.log("띠용..");
            console.log(err);
        });

        followers_instance.save()
        .then( followers => {
            console.log(followers);
        })
        .catch( err => {
            console.log("의읭?");
            console.log(err);
        });

        condition = 1;
      }else{
        //unlike
       console.log("WTF?");
       Following.deleteOne({memberID:mongoose.Types.ObjectId(user_id), followingMemberID:mongoose.Types.ObjectId(following_user_id)})
        .then( following => {
            //res.status(204).end();
            //console.log('unlike3');
        })
        .catch( err => {
            console.log(err);
            return res.status(500).json({error: 'database failure'});
        });


        Followers.deleteOne({memberID:mongoose.Types.ObjectId(following_user_id), followersID:mongoose.Types.ObjectId(user_id)})
        .then( following => {
            //res.status(204).end();
            //console.log('unlike3333');
        })
        .catch( err => {
            console.log(err);
            return res.status(500).json({error: 'database failure'});
        });

        condition = 2;
      }
    }

    const respond = ()=>{
      res.json({
        message: 'done'
      })
    }

    const onError = (error)=>{
      console.log(error.message);
    }

    Following.findOneFollowingByQuery({"memberID": mongoose.Types.ObjectId(user_id), "followingMemberID": mongoose.Types.ObjectId(following_user_id)})
    .then(create)
    .then(respond)
    .catch(onError)
  }

/*
    GET /api/member/me/followings
*/
  exports.getMyfollowings = (req, res) => {
    let id = req.decoded._id;

    // respond the token
    const respond = (followings) => {
      res.json({
        message: 'successfully load member',
        followings
      })
    }

    // error occured
    const onError = (error) => {
    res.status(403).json({
        message: error.message
      })
    }

    Following.findFollowingByMemberID(id)
    .then(respond)
    .catch(onError);
  }
