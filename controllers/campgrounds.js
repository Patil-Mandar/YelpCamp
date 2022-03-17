const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary')

const geocoder = mbxGeocoding({accessToken:process.env.MAPBOX_TOKEN})


module.exports.index =  async (req,res) => {
    const campgrounds = await Campground.find({})
    res.render('campground/index',{campgrounds})
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campground/new')
}

module.exports.creatNewCampground = async (req,res,next)=>{
    const {campground} = req.body
    const geoCode = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit:1
    }).send()
    // if(!campground) throw new ExpressError('Invalid data',400)    -> this can be done when we only have very few condition to check
    const camp = new Campground(campground)
    camp.geometry = geoCode.body.features[0].geometry
    camp.images = req.files.map(f => ({url:f.path, filename:f.filename}))
    camp.author = req.user._id
    await camp.save()
    console.log(camp)
    req.flash('success','Successfully created a new campground!')
    res.redirect(`/campground/${camp._id}`)
}

module.exports.showCampground = async (req,res) => {
    const {id} = req.params
    const camp = await Campground.findById(id).populate('author')   //to replace the id with it's actual obj from referencing collection
        .populate({
            path : 'reviews',
            populate : {
                path: 'author'      // to populate the authors inside the reviews
            }
        })
    if(!camp){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campground')
    }
    // console.log(camp)
    res.render('campground/show',{camp})
}

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params
    const camp = await Campground.findById(id)
    if(!camp){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campground')
    }
    res.render('campground/edit',{camp})
}

module.exports.editCampground = async (req,res)=>{
    const {campground} = req.body
    const {id} = req.params
    const camp = await Campground.findByIdAndUpdate(id,campground)
    const images = req.files.map(f => ({url:f.path, filename:f.filename}))
    camp.images.push(...images)
    await camp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success','Updated the information')
    res.redirect(`/campground/${id}`)
}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)      //also triggers the mongoose middleware for deleting all revoiews asociated with it
    req.flash('warning','Campground deleted')
    res.redirect('/campground')
}
