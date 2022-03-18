const Campground = require('./models/campground');
const Review = require('./models/review');
const {campgroundSchema,reviewSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError');


module.exports.isLogedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnToUrl = req.originalUrl
        req.flash('error','You need to Log In first!')
        return res.redirect('/login')
    }
    next()
}

module.exports.isAuthor = async (req,res,next)=>{
    const {id} = req.params
    const camp = await Campground.findById(id)
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You are not authorizes to do that!')
        return res.redirect(`/campground/${id}`)
    }
    next()
}

module.exports.isreviewAuthor = async (req,res,next)=>{
    const {id,reviewid} = req.params
    const review = await Review.findById(reviewid)
    if(!review.author.equals(req.user._id)){
        req.flash('error','You are not authorizes to do that!')
        return res.redirect(`/campground/${id}`)
    }
    next()
}

// a middleware for validating the data
module.exports.validateCampground = (req,res,next) => {

    const {error} = campgroundSchema.validate(req.body) //verify the data before using the mongoose
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}

// a middleware for validating the data
module.exports.validateReview = (req,res,next) => {
    
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next()
    }
}