import express from "express";
const router = express.Router();
import loginDBFunctions from "../service/loginDBFunctions.js"

// Routes get, put, post, delete
router.get('/', (req, res) => {
    res.render('login', { title: 'Login' });
})

router.post('/', async (req, res) => { // TJEKKER LOGIN VED HJÆLP AF VORES FUNCTION
    const { username, password } = req.body
    if (await loginDBFunctions.checkLogInUser(username.toLowerCase(), password)) {
        req.session.isLoggedIn = true
        req.session.username = username.toLowerCase()
        req.session.isAdmin = await loginDBFunctions.checkIsAdmin(username)
        res.redirect('/')
    } else {
        res.redirect('/login')
    }
})

export default router;