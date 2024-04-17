const router = require('express').Router()
const { me, courses, course, members, newCourse, newMember, cancelCourse, cancelMember, updateMe, downloadCert } = require('../controller/other/profile.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('business', 'student'), me)
router.put('/', authorized('business', 'student'), updateMe)

router.get('/courses', authorized('business', 'student'), courses)
router.post('/courses', authorized('business', 'student'), newCourse)
router.get('/courses/:_id', authorized('business', 'student'), course)
router.put('/courses/:_id', authorized('business', 'student'), cancelCourse)

router.get('/members', authorized('business'), members)
router.post('/members', authorized('business'), newMember)
router.put('/members/:_id', authorized('business'), cancelMember)

router.get('/cert/:_id', authorized('business', 'student'), downloadCert)

module.exports = router
