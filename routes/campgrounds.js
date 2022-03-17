const express = require('express')
const router = express.Router();
const multer = require('multer')        //To render the multipart/form type
const CatchAsync = require('../utils/CatchAsync')
const campgrounds = require('../controllers/campgrounds')
const {isLogedIn,isAuthor,validateCampground} = require('../middleware')
const {storage} = require('../cloudinary')
// const upload = multer({dest:'uploads/'})
const upload = multer({storage})



router.get('/',CatchAsync(campgrounds.index))

router.route('/new')
    .get(isLogedIn, campgrounds.renderNewForm)
    .post(isLogedIn,upload.array('image'),validateCampground, CatchAsync(campgrounds.creatNewCampground))
    // ^ Better Way to write below code

// router.post('/new',async (req,res,next)=>{
//     try{
//         const {campground} = req.body
//         const camp = new Campground(campground)
//         await camp.save()
//         res.redirect(`/campground/${camp._id}`)
//     }catch(err){
//         next(err)               //send err to next error handler middleware
//     }
// })

router.route('/:id')
    .get(CatchAsync(campgrounds.showCampground))
    .delete(isLogedIn,isAuthor,CatchAsync(campgrounds.deleteCampground))

router.route('/:id/edit')
    .get(isLogedIn,isAuthor,CatchAsync(campgrounds.renderEditForm))
    .put(isLogedIn,isAuthor,upload.array('image'),validateCampground,CatchAsync(campgrounds.editCampground))



module.exports = router