const jwt = require('jsonwebtoken')
const Member = require('../../../models/Member')
const CryptoJS = require("crypto-js");
const configs = require('../../../common/configs');
const request = require("request");
const fs = require('fs');
const utils = require('../../../common/utils');
const sharp = require('sharp');

/*
    POST /api/auth/register
    {
        email,
        password,
        nickname,
        gender,
        birth,
        profileLink
    }
*/
function isValidName(name){
  //
    if(name.length<2 || name.length > 16){
        return false;
    }

    let regx = /[^a-zA-Z0-9|ㄱ-ㅎ|ㅏ-ㅣ|가-힣_]/;
    return !regx.test(name);      // 유효하면 true반환
}

function isValidEmail(email){
  var regx = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regx.test(email);
}

function isValidPassWord(str){

  var pw = str;
  var num = pw.search(/[0-9]/g);
  var eng = pw.search(/[a-z]/ig);
  var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
  let msg;

  if(pw.length < 8 || pw.length > 16){
    msg = "8자리 ~ 20자리 이내로 입력해주세요.";
    console.log(msg)
    return false;
  }

  if(pw.search(/₩s/) != -1){
    msg = "비밀번호는 공백없이 입력해주세요.";
    console.log(msg)
    return false;
  }

  if(num < 0 || eng < 0 || spe < 0 ){
    msg = "영문,숫자, 특수문자를 혼합하여 입력해주세요.";
    console.log(msg)
    return false;
  }
  return true;
}

exports.register = (req, res) => {
  //console.log(req.body);
  let { email, password, nickname } = req.body;
  var profileLink = '';


  let newMember = null
  let userid = 'local:' + email;

  // create a new member if does not exist
  const create = (member) => {
    if(!isValidEmail(email)){ 
      throw new Error('Invalid Email Form!!');
    }
    if(!isValidPassWord(password)){
      throw new Error('Invalid Password Form!!');
    }
    if(!isValidName(nickname)){
      throw new Error('Invalid Nickname Form!!')
    }
      if(!utils.isEmpty(member)) { // 만약 이미 가입한 회원이라면
          if (!utils.isEmpty(req.file)) { // 파일이 있을 경우 삭제해줌
              console.log(req.file);
              fs.unlink(req.file.path, (err) => {
              });
          }
          throw new Error('userid exists')
      } else {
        if (utils.isEmpty(req.file)) { // 파일이 없을 경우 기본 프로필 사진으로 설정
          profileLink = configs.BASIC_PROFILE;
          //console.log("뀨뀨꺄꺄");
        }
        else if (!utils.isImage(req.file.mimetype)) {
          fs.unlink(req.file.path, err => {
            console.log('delete done');
          });

          return res.status(409).json({
            message: 'file mimetype doent match!'
          });
        }
        else {
          console.log(req.file);

          console.log(req.file.path);
          let filepath = req.file.path;
          //filepath = utils.replaceAll(filepath, '\\', '/');
          //console.log(filepath);

          profileLink = configs.PROFILE_FOLDER + 'profile_' + req.file.filename;
          console.log(configs.ROOT_FOLDER + profileLink);

          // filepath에 있는 이미지를 불러와 이미지 리사이징 후 원본 이미지 삭제
          fs.readFile(filepath, (err,data) => {
            if (err) {
              console.log('Error reading file ' + fileIn + ' ' + err.toString());
            } else {
              sharp(data)
              .resize({width: 100, height: 100, fit: "fill"})
              .toFile(configs.ROOT_FOLDER + profileLink, (err) => {
                if (err) {
                  console.log('Error ' + configs.ROOT_FOLDER + profileLink + ' ' + err.toString());
                } else {
                  console.log('made ' + configs.ROOT_FOLDER + profileLink);
                  fs.unlink(filepath, (err) => {
                    if (err) {
                      console.log('error deleting ' + filepath + ' ' + err.toString());
                    } else {
                      console.log('deleted ' + filepath);
                    }
                  });
                }
              });
            }
          });
        }
        //console.log("읭?");
        return Member.create(userid, email, password, nickname, profileLink);

      }
  }

  // count the number of the user
  const count = (member) => {
      console.log(member);
      newMember = member
      return Member.countDocuments({}).exec()
  }

  // assign admin if count is 1
  const assign = (count) => {
      if(count === 1) {
          return newMember.assignAdmin()
      } else {
          // if not, return a promise that returns false
          return Promise.resolve(false)
      }
  }

  // respond to the client
  const respond = (isAdmin) => {
      res.json({
          message: 'registered successfully',
          admin: isAdmin ? true : false
      })
  }

  // run when there is an error (username exists)
  const onError = (error) => {
      console.log(error);
      res.status(409).json({
          message: error.message
      })
  }

  // check username duplication
  Member.findOneByUserID(userid)
  .then(create)
  .then(count)
  .then(assign)
  .then(respond)
  .catch(onError)
}


/*
    POST /api/auth/login
    {
        email,
        password
    }
*/

exports.login = (req, res) => {
  let {email, password} = req.body
  let userid = 'local:' + email;

  const secret = req.app.get('jwt-secret')

  console.log(userid);
  // check the member info & generate the jwt
      // check the member info & generate the jwt
  const check = (member) => {
    if(utils.isEmpty(member)) {
      console.log(member);
      // user does not exist
      console.log("????");
      throw new Error('login failed')
    } else {
      // user exists, check the password
      if(member.verify(password)) {
        //console.log("뀨뀨꺄꺄");
        // create a promise that generates jwt asynchronously
        const p = new Promise((resolve, reject) => {
          jwt.sign({
            _id: member._id,
            email: member.username,
            admin: member.admin
          },
          secret,
          {
            //expiresIn: '7d',
            issuer: 'www.vlap.com',
            subject: 'memberInfo'
          }, (err, token) => {
            if (err) reject(err)
            resolve(token)
          })
        });
        return p
      } else {
        throw new Error('login failed')
      }
    }
  }

  // respond the token
  const respond = (token) => {
      res.json({
          message: 'logged in successfully',
          token
      })
  }

  // error occured
  const onError = (error) => {
      console.log(error);
      res.status(403).json({
          message: error.message
      })
  }

  // find the user
  Member.findOneByUserID(userid)
  .then(check)
  .then(respond)
  .catch(onError)
}

/*
    GET /api/auth/check
*/
exports.check = (req, res) => {
  res.json({
      success: true,
      info: req.decoded
  })
}

/*
    POST /api/auth/flogin
    {
        id,
        name;
        profile;
    }
*/
exports.flogin = (req, res) => {
  console.log('POST /api/auth/flogin');
  //console.log(req.body);

  //var profile = JSON.parse(req.body.profile);
  const secret = req.app.get('jwt-secret')

  let bytes  = CryptoJS.AES.decrypt(req.body.cipherProfile, configs.CRYPTOKEY);
  let plaintext = bytes.toString(CryptoJS.enc.Utf8);

  console.log(plaintext);

  let profile = JSON.parse(plaintext);

  let name = profile.name;
  let userid = 'facebook:' + profile.id;
  let url = profile.picture.data.url; // profile uri 정보
  let fileLink = configs.PROFILE_FOLDER + Date.now() + '.jpg';

  let newMember = null

  // create a new member if does not exist
  const create = (member) => {
    if(!utils.isEmpty(member)) { // 만약 이미 가입한 회원이라면 기존 회원을 반환
      return member;
    } else { // 가입이 되어 있지 않을 경우 프로필 사진을 다운로드 후 회원을 생성
      var r = request({
        url: url,
        headers: {
          'accept': 'image/*',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36',
        }
      }).pipe(fs.createWriteStream('./uploads/' + fileLink));

      r.on('error', function(err) {console.log(err)})
      r.on('close', function() {console.log('Done downloading..')});

      return Member.facebookCreate(userid, configs.FACEBOOK_PASSWORD, name, fileLink);
    }
  }

  const check = (member) => {
    if(!member) {
      // user does not exist
      throw new Error('login failed')
    } else {
      console.log(member);
      // user exists, check the password
      const p = new Promise((resolve, reject) => {
        jwt.sign(
        {
          _id: member._id,
          email: member.username,
          admin: member.admin
        },
        secret,
        {
          expiresIn: '7d',
          issuer: 'www.vlap.com',
          subject: 'memberInfo'
        }, (err, token) => {
          if (err) {
              console.log(err);
              reject(err);
          }
          console.log('Token');
          console.log(token);
          resolve(token)
        })
      });
      return p
    }
  }

  // respond the token
  const respond = (token) => {
    res.json({
      message: 'logged in successfully',
      token
    })
  }

  // error occured
  const onError = (error) => {
    console.log(error);
    res.status(403).json({
      message: error.message
    })
  }

  // find the user
  Member.findOneByUserID(userid)
  .then(create)
  .then(check)
  .then(respond)
  .catch(onError)
}
