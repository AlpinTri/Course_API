const router = require('express').Router()
const { findAll, createOne, updateOne, destroyOne, findOne } = require('../controller/resource/student.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin'), findAll)
router.get('/:_id', authorized('admin'), findOne)

router.post('/', authorized('admin'), createOne)

router.put('/:_id', authorized('admin'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
