import express from "express";
import pug from "pug";
import expressSession from "express-session";
import { v4 as uuidv4 } from 'uuid';
import bodyParser from "body-parser";

import loginRoute from './routes/loginRoutes.js'
import registreringRoute from './routes/registreringRoute.js'
import profilRoutes from './routes/profilRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express();

const port = "1234";

// View engine
app.set('view engine', 'pug');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('assets'))
app.use(expressSession({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    let isLoggedIn = false;
    let isAdmin = false;
    if (req.session && req.session.isLoggedIn) {
        isLoggedIn = true;
    }
    if (req.session && req.session.isAdmin) {
        isAdmin = true;
    }
    res.locals.isLoggedIn = isLoggedIn
    res.locals.isAdmin = isAdmin
    next()
})

app.use("/login", loginRoute)
app.use("/registrering", registreringRoute)
app.use("/profil", profilRoutes)
app.use("/booking", bookingRoutes)
app.use("/admin", adminRoutes)

// ---------------------------------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.render('forside', { title: 'Forside', isLoggedIn: res.locals.isLoggedIn });
});

app.get('/logout', (req, res) => { //LOGOUT PAGE
    req.session.destroy()
    res.redirect('/')
})


// Start server
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})

export default { app }