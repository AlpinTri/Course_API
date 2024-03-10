const router = require('express').Router()
const { findAll, findOne, createOne, updateOne, destroyOne } = require('../controller/resource/training.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin', 'trainer', 'student', 'company'), findAll)
router.get('/:_id', authorized('admin', 'trainer', 'student', 'company'), findOne)

router.post('/', authorized('admin', 'student', 'company'), createOne)

router.put('/:_id', authorized('admin', 'company'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
