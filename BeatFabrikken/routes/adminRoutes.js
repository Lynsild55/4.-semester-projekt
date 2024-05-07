import express from "express";
const router = express.Router();
import bookingDBFunctions from "../service/BookingDBFunctions.js"
import loginDBFunctions from "../service/loginDBFunctions.js"
import administratorDBFunctions from "../service/administratorDBFunctions.js";


router.get('/', async (req, res) => {
    if (req.session.isLoggedIn) {
       let lokaler = await bookingDBFunctions.getLokaler();
       let bookinger = await bookingDBFunctions.getBookinger();
        res.render('admin', { title: 'admin', lokaler: lokaler, bookinger: bookinger}); 
    } else {
        res.redirect('/')
    }
})


router.post('/opretHold', async (req, res) => {
    if (req.session.isAdmin) {
        const {alder, holdNavn, instruktør, pris} = req.body
        const hold = {alder: alder, holdNavn: holdNavn, instruktør: instruktør, pris: pris}
        const svar = await administratorDBFunctions.getHold(holdNavn)
        if (svar) {
            res.status(210)
            res.end()
        } else {
            let id = await administratorDBFunctions.addHold(hold)
            if (id != false) {
                res.status(200)
                res.end()
            } else {
                res.status(204)
                res.end()
            }
        }
    } else {
        res.status(208)
        res.end()
    }
})

router.get('/bookinger/:lokaleId', async (req, res) => {
    let bookinger = await bookingDBFunctions.getBookingForLokale(req.params.lokaleId);
    res.json(bookinger);
})

router.post('/delete/:bookingId', async (req, res) => {
    if (req.session.isLoggedIn) {
        const bookingId = req.params.bookingId;
        const deleted = await bookingDBFunctions.deleteBooking(bookingId);
        if (deleted) {
          res.redirect('/admin'); // Redirect tilbage til booking management side
        } else {
          res.status(500).send('Kunne ikke slette bookingen');
        }
      }
    });

export default router;