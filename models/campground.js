const { number } = require('joi')
const mongoose = require('mongoose')
const Review = require('./review')

const imageSchema = new mongoose.Schema({
    url:String,
    filename:String
})

imageSchema.virtual('thumbnail').get(function() {                //This will behave as a attribute but it's value will be calculated each time and no need to save it in database
    return this.url.replace('/upload','/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };  //as mongoose doest save virtuals in JSON format
const campgroundSchema = new mongoose.Schema({
    title:String,
    price:Number,
    location:String,
    geometry: {
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type: [Number],
            required:true
        }
    },
    description:String,
    images:[imageSchema],
    reviews:[               //foriegn key
        {
            type:mongoose.Schema.Types.ObjectId,   
            ref:'Review'    //Referensing Model
        }
    ],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},opts)

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <h6>${this.title}</h6>
    <p>${this.description.substring(0, 40)}...</p>
    <a href="/campground/${this._id}" class="btn btn-primary btn-sm">View</a>`
});

campgroundSchema.post('findOneAndDelete',async (doc)=>{     //mongoose middleware
    if(doc){
        await Review.deleteMany({
            _id : {$in:doc.reviews}
        })
    }
})

const  Campground = mongoose.model('Campground',campgroundSchema)

module.exports = Campground