import express from "express";
const router = express.Router();
import registreringDBFunctions from "../service/registreringDBFunctions.js"

router.get('/', (req, res) => {
    res.render('registrering', { title: 'Registrering', isLoggedIn: res.locals.isLoggedIn });
})

router.post('/', async (req, res) => {
    const { username, password, firstName, lastName, email, mobilnummer } = req.body;
    const user = { username: username.toLowerCase(), password: password, firstname: firstName, lastname: lastName, email: email, mobilnummer: mobilnummer }
    let id = await registreringDBFunctions.addUser(user);
    if (id != false) {
        res.status(200)
        res.end()   
    } else {
        res.status(204)
        res.end()
    }
})

export default router;