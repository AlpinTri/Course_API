const router = require('express').Router()
const { findAll, findOne, createOne, updateOne, destroyOne } = require('../controller/resource/course.controller')
const authorized = require('../middleware/authorized.middleware')
const protect = require('../middleware/protected.middleware')

router.get('/', findAll)
router.get('/:_id', findOne)

router.use(protect)

router.post('/', authorized('admin'), createOne)

router.put('/:_id', authorized('admin'), updateOne)

router.delete('/:_id', authorized('admin'), destroyOne)

module.exports = router
