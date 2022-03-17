const express = require('express')
const reviews = require('../controllers/reviews')
const router = express.Router({mergeParams:true})  //mergeParams is to add the parasm form prefix req
const CatchAsync = require('../utils/CatchAsync')
const {isLogedIn,isreviewAuthor,validateReview} = require('../middleware')


router.post('/',isLogedIn,validateReview ,CatchAsync(reviews.creatNewReview))

router.delete('/:reviewid',isLogedIn,isreviewAuthor,CatchAsync(reviews.deleteReview))

module.exports = router