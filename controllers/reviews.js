const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.creatNewReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    review.author = req.user._id
    await review.save()
    await campground.save()
    req.flash('success','Added the review')
    res.redirect(`/campground/${campground._id}`);
}

module.exports.deleteReview =  async (req,res)=>{
    const {id,reviewid} = req.params
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewid}}) //pull(remove element from array) will remove the review with id reviewid
    await Review.findByIdAndDelete(reviewid)
    req.flash('warning','Deleted the review')
    res.redirect(`/campground/${id}`)
}