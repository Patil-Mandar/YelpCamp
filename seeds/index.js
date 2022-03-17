//To seed some base db to work with
const mongoose = require('mongoose')
const Campground = require('../models/campground')  // .. -> go one step back and then models dir
const cities = require('./cities')
const { descriptors, places } = require('./seedHelper')

mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(data => console.log("Database connected"))
    .catch(err => console.log("Database connection failed"))

const giveRandomElement = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDb = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            title: `${giveRandomElement(descriptors)} ${giveRandomElement(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo veritatis facilis illo laboriosam commodi vitae voluptate quidem ullam cupiditate? Debitis ullam unde quidem quis nihil iure earum. Obcaecati, minima accusantium?',
            images: [
                {
                    url: "https://res.cloudinary.com/mandar/image/upload/v1647432037/YelpCamp/lxwbv8f8it3z3u6jglec.jpg",
                    filename: "YelpCamp/lxwbv8f8it3z3u6jglec"
                },
                { 
                    url: "https://res.cloudinary.com/mandar/image/upload/v1647432042/YelpCamp/yd5yrtwk9wpgttc2qeje.jpg", 
                    filename: "YelpCamp/yd5yrtwk9wpgttc2qeje"
                }],
            price: random1000 / 10,
            author: '6215efde9cedc4e742d7b533'
        })
        await camp.save()
    }
}

seedDb()
    .then(() => {
        mongoose.connection.close() //close connection after using it
    })