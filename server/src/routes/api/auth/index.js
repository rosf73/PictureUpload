/**
 POST /register = 회원 등록
 POST /login = 회원 로그인(JWT 토큰 발급)
 GET /check = JWT 토큰 내용 확인
 POST /flogin = 페이스북 로그인(회원이 존재하지 않을 경우 자동 가입 및 JWT 발급)
 */

const router = require('express').Router()
const controller = require('./auth.controller')
const authMiddleware = require('../../../middlewares/auth')

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

router.post('/register', upload.single('profile'), controller.register)
router.post('/login', controller.login)

// POST /check 처리 전 middleware를 통한 jwt 검증
router.use('/check', authMiddleware)
router.get('/check', controller.check)

router.post('/flogin', controller.flogin)

module.exports = router