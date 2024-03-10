const router = require('express').Router()
const { findAll, findOne, createOne, updateOne, destroyOne } = require('../controller/resource/user.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('admin', 'business', 'student', 'trainer'), findAll)
router.get('/:_id', authorized('admin', 'business', 'student', 'trainer'), findOne)

router.post('/', createOne)

router.put('/:_id', authorized('admin'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
