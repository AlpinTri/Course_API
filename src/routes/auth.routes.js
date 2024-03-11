const limiter = require('../middleware/limiter.middleware')
const router = require('express').Router()

router.post('/login', limiter(100), require('../controller/auth/login.controller'))
router.post('/logout', require('../controller/auth/logout.controller'))
router.post('/refresh', limiter(10), require('../controller/auth/refresh.controller'))

module.exports = router
