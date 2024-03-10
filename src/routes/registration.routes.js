const router = require('express').Router()
const { individual, group } = require('../controller/business/registration.controller')

router.post('/individual', individual)
router.post('/group', group)

module.exports = router
