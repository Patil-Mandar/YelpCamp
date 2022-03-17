const express = require('express')
const CatchAsync = require('../utils/CatchAsync')
const users = require('../controllers/users')
const passport = require('passport')
const router = express.Router()

router.route('/register')
    .get(users.renderRegisterForm)
    .post(CatchAsync(users.createNewUser))

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)
    
router.get('/logout',users.logOut)

module.exports = router