const User = require('../models/users')


module.exports.renderRegisterForm = (req,res)=>{
    res.render('user/register')
}

module.exports.createNewUser = async (req,res)=>{
    try{
        const {username,email,password} = req.body
        const user = new User({username,email})
        const registeredUser = await User.register(user,password)   //registering new user
        // req.flash('success','Registered Successfully!')
        // res.redirect('/campground')
        req.login(registeredUser,err => {       //to login after registering
            if(err) return next(err)
                req.flash('success','Registered Successfully!')
                res.redirect('/campground')
        })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render('user/login')
}

module.exports.login = (req,res)=>{
    const returnToUrl = req.session.returnToUrl || '/campground'
    req.flash('success','Welcome back!!')
    res.redirect(returnToUrl)
}

module.exports.logOut = (req,res)=>{
    req.logOut();
    req.flash('warning','Sayonara!')
    res.redirect('/campground')
}