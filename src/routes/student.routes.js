const router = require('express').Router()
const { findAll, createOne, updateOne, destroyOne, findOne } = require('../controller/resource/student.controller')
const authorized = require('../middleware/authorized.middleware')

router.get('/', authorized('business', 'admin'), findAll)
router.get('/:_id', authorized('business', 'admin', 'student'), findOne)

router.post('/', authorized('business', 'admin'), createOne)

router.put('/:_id', authorized('business', 'admin'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
