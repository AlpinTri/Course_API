const router = require('express').Router()
const { findAll, findOne, createOne, updateOne, destroyOne } = require('../controller/resource/company.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin'), findAll)
router.get('/:_id', authorized('admin', 'business'), findOne)

router.post('/', authorized('admin'), createOne)

router.put('/:_id', authorized('admin'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
