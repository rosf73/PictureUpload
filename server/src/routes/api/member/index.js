/**
 GET /me = 내 프로필 조회
 GET /:member_id = 멤버 프로필 조회
 POST /follow/:member_id = 팔로우 하기
 GET /me/followings = 팔로잉 리스트 조회
 PUT /me = 회원정보수정
 */

const router = require('express').Router()
const controller = require('./member.controller')
const authMiddleware = require('../../../middlewares/auth')
const smoothAuthMiddleware = require('../../../middlewares/smoothauth')

const multer = require('multer')

const profileStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    //req.dirname = 'upload/temp';
    callback(null, 'uploads/member');
  },
  filename: function(req, file, callback) {
    var idx = file.originalname.lastIndexOf('.');
    var filename = Date.now() + file.originalname.substring(idx).toLowerCase();
    //req.filename = filename;
    //req.mimetype = file.mimetype;

    callback(null, filename);
  }
});

const upload = multer({ storage: profileStorage });

router.get('/list', controller.list)
//router.post('/assign-admin/:uesrid', controller.assignAdmin)

router.use('/list/:member_id', smoothAuthMiddleware);
router.get('/list/:member_id', controller.findByID);

router.use('/me', authMiddleware);
router.get('/me', controller.me);

//router.use('/:member_id', authMiddleware);
router.use('/follow/:member_id', authMiddleware);
router.post('/follow/:member_id', controller.follow);

router.use('/me/followings', authMiddleware);
router.get('/me/followings', controller.getMyfollowings);

router.use('/me', upload.single('profile'), authMiddleware);
router.put('/me', controller.updateme);

module.exports = router