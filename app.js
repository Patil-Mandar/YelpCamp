if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const ExpressError = require('./utils/ExpressError')
const campgroudRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const User = require('./models/users')
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp'
const secret = process.env.SECRET || 'thisIsASecretMessage'

// mongoose.connect('mongodb://localhost:27017/YelpCamp')       //for local db
mongoose.connect(dbUrl)
    .then(data => console.log("Database connected"))
    .catch(err => console.log("Database connection failed"))

const app = express()

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static('public'))   //to add static file like css, html in template
app.use(mongoSanitize())


const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60
})
store.on('error',e => {
    console.log('Session Error!!! ',e)
})

const sessionConfig = {
    store,
    name: 'YelpCampSession',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,  //just a extra layer of security to avoid client site req / cross-plaform req
        // secure: true,        //how extra security (sends no cookies for local host as well)
        expires:Date.now() + (1000 * 60 * 60 * 24 * 7),     //expires after 1 week of creation
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig))
app.use(flash())

//config passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware for flashing all msg
app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')       //this will send success to all the rendering requests
    res.locals.warning = req.flash('warning')
    res.locals.error = req.flash('error')
    next()
})

app.use('/campground',campgroudRoutes)
app.use('/campground/:id/reviews',reviewRoutes)
app.use('/',userRoutes)

app.get('/',(req,res) => {
    res.render('home')
})

app.get('/fakeUser',async (req,res)=>{
    const user = new User({email:'mandar.patil@vit.edu',username:'mandar'})
    const newUser = await User.register(user,'monkey')
    res.send(newUser)
})

//to resposne all undefined routes
//NOTE: should be placed last
app.all('*',(req,res)=>{
    throw new ExpressError(`Page not found`,404)
})

//Basic error handler
app.use((err,req,res,next)=>{
    const {statusCode=500} = err   //gave some default values
    if(!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('campground/error',{err})
})

const port = process.env.PORT || '3000'
app.listen(port,() => {
    console.log(`Connnected to Port ${port}`)
})


//Routes:
//GET       '/'                       Home      - Home page
//GET       '/campground'            Index     - show all campgrounds   
//GET       '/campground/:id'        Show      - show particular campground 
//GET       '/campground/new'        New       - form for new campground
//POST      '/campground/new'        New       - posting new data
//GET       '/campground/:id/edit'   Edit      - form for editing existing campground
//PUT       '/campground/:id/edit'   Edit      - posting the changes
//DELETE    '/campground/:id'        Delete    - deleting particular campground
//POST      '/campground/:id/reviews'          - Add review to particular campground      
//GET       '/register'                        - form for new user
//POST      '/register'                        - register new user 