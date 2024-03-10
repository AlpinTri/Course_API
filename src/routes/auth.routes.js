const router = require('express').Router()

router.post('/login', require('../controller/auth/login.controller'))
router.post('/logout', require('../controller/auth/logout.controller'))
router.post('/refresh', require('../controller/auth/refresh.controller'))

module.exports = router
