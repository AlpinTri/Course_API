const router = require('express').Router()
const { dashboard } = require('../controller/other/dashboard.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin', 'trainer'), dashboard)

module.exports = router
