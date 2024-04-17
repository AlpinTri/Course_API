const router = require('express').Router()
const { findAll, findOne, createOne, updateOne, destroyOne } = require('../controller/resource/schedule.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin', 'trainer'), findAll)
router.get('/:_id', authorized('admin', 'trainer'), findOne)

router.post('/', authorized('admin'), createOne)

router.put('/:_id', authorized('admin', 'trainer'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
