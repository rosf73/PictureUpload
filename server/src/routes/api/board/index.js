/**
 GET ?tag={tag}&page={page} = 게시물 태그 검색 (with paging) 
 GET /post = 전체 게시물 조회
 GET /post/:member_id = 회원 게시물 조회
 GET /detail/:post_id = 게시물 상세 조회(게시물 조회수 증가 및 좋아요 여부 반환)
 POST /post = 게시물 등록
 POST /post/like/:post_id = 게시물 좋아요
 POST /post/comment/:post_id = 댓글 작성
 GET /post/comment/:post_id = 댓글 조회
 DELETE /post/:post_id = 게시물 삭제
 GET /me/followingspost = 구독자 게시물 조회(게시물, 구독자 리스트 반환)
 GET /hot = 인기 게시물 조회
 GET /recommendedPost = 추천 게시물 조회
 */

const router = require('express').Router()
const controller = require('./board.controller')
const authMiddleware = require('../../../middlewares/auth')
const smoothAuthMiddleware = require('../../../middlewares/smoothauth')

const multer = require('multer')

const resourceStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    //req.dirname = 'upload/temp';
    callback(null, 'uploads/resources');
  },
  filename: function(req, file, callback) {
    var idx = file.originalname.lastIndexOf('.');
    var filename = Date.now() + file.originalname.substring(idx).toLowerCase();
    //req.filename = filename;
    //req.mimetype = file.mimetype;

    callback(null, filename);
  }
});

const upload = multer({ storage: resourceStorage });

// member_id를 가진 회원이 작성한 글 조회
router.get('/post/:member_id', controller.findPostByMemberID);

// 자신의 게시물 조회
router.use('/me', authMiddleware);
router.get('/me', controller.me);

// 글 조회
router.get('/post', controller.findPostByQuery);
//인기글 조회
router.get('/hot', controller.hot)

// 구독자 글 조회
router.use('/me/followingspost', authMiddleware);
router.get('/me/followingspost', controller.findFollowingsPost);

//추천 글 조회
router.use('/recommendedPost', authMiddleware);
router.get('/recommendedPost', controller.findRecommendedPost);

//추천 글 조회2 (코사인 유사도 측정 방식)
router.use('/recommendedPostHard', authMiddleware);
router.get('/recommendedPostHard', controller.findRecommendedPostHard);

//추천 글 조회3 (코사인 유사도 측정 방식)
router.use('/recommendedPostHardNew', authMiddleware);
router.get('/recommendedPostHardNew', controller.findRecommendedPostHardNew);

//추천 글 조회3 (히든 태그 리스트 비율 방식)
router.use('/recommendedPostEasy', authMiddleware);
router.get('/recommendedPostEasy', controller.findRecommendedPostEasy);

// 글 작성
router.use('/post', authMiddleware);
router.post('/post', upload.array('contents[]'), controller.post);

// 게시물 좋아요
router.use('/post/like/:post_id', authMiddleware);
router.post('/post/like/:post_id', controller.like);

// 댓글 작성
router.use('/post/comment/:post_id', authMiddleware);
router.post('/post/comment/:post_id', controller.postcomment);

// 댓글 조회
router.use('/post/comment/:post_id', authMiddleware);
router.get('/post/comment/:post_id', controller.getcomment);

// 댓글 삭제
router.use('/post/comment/:post_id', authMiddleware);
router.delete('/post/comment/:post_id/:comment_id', controller.deletecomment);

// 게시물 삭제
router.use('/post/:post_id', authMiddleware);
router.delete('/post/:post_id', controller.deletepost);

// 게시물 태그 검색
router.get('/', controller.searchtag);

// 게시물 상세 조회
router.use('/detail/:post_id', smoothAuthMiddleware);
router.get('/detail/:post_id', controller.detailpost);

// Interest Merge
//router.use('/mergelike', authMiddleware);
//router.get('/mergelike', controller.mergelike);

module.exports = router
