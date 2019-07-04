const router = require('express').Router()
const authMiddleware = require('../../middlewares/auth')
const auth = require('./auth')
//const user = require('./user')
const member = require('./member')
const board = require('./board')
const map = require('./map')

router.use('/auth', auth);

/*
// api/user의 모든 api는 jwt 토큰 인증이 필요함
router.use('/user', authMiddleware)
router.use('/user', user)
*/

// api/user의 모든 api는 jwt 토큰 인증이 필요함
//router.use('/member', authMiddleware);
router.use('/member', member);

router.use('/board', board);
router.use('/map', map);

module.exports = router
