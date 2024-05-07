import express from "express";
const router = express.Router();
import bookingDBFunctions from "../service/BookingDBFunctions.js"
import loginDBFunctions from "../service/loginDBFunctions.js"
import administratorDBFunctions from "../service/administratorDBFunctions.js"

router.get('/', async (req, res) => {
    let lokaler = await bookingDBFunctions.getLokaler();
    let hold = await administratorDBFunctions.getAlleHold();
    res.render('booking', { title: 'Booking', lokaler: lokaler, hold: hold, isAdmin: req.session.isAdmin });
})

router.post('/', async (req, res) => {
    if (req.session.isLoggedIn) {
        const { date, lokaleId, tid } = req.body
        const username = req.session.username;
        const booking = { dato: date, lokaleId: lokaleId, tid: tid, username: username }
        const svar = await bookingDBFunctions.getBooking(date, tid, lokaleId);
        if (svar) {
            res.status(210)
            res.end()
        } else {
            let id = await bookingDBFunctions.addBooking(booking)
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

router.post('/fastbooking', async (req, res) => {
    if (req.session.isLoggedIn) {
        if (req.session.isAdmin) {
            const { date, lokaleId, tid, hold, slutDato } = req.body

            let startDate = new Date();
            startDate.setFullYear(date.substring(0, 4), date.substring(5, 7), date.substring(8, 10))
            startDate.setMonth(startDate.getMonth() - 1)

            let slutDate = new Date();
            slutDate.setFullYear(slutDato.substring(0, 4), slutDato.substring(5, 7), slutDato.substring(8, 10))
            slutDate.setMonth(slutDate.getMonth() - 1)

            let loopdate = new Date(startDate);

            const fastbooking = { dato: date, lokaleId: lokaleId, tid: tid, username: hold }
            let loopBooking = fastbooking;

            let done = false;
            let bookinger = await bookingDBFunctions.getBookinger();
            bookinger = bookinger.filter((e) => e.lokaleId == lokaleId)
            while (!done) {
                let svar = bookinger.find((e) => {
                    return e.dato == loopBooking.dato && e.tid == loopBooking.tid
                })
                if (svar) {
                    res.status(210)
                    res.end()
                    break;
                }
                if (loopdate.getTime() > slutDate.getTime()) {
                    done = true;
                } else {
                    loopdate.setDate(loopdate.getDate() + 7)
                    loopBooking.dato = loopdate.toISOString().slice(0, 10)
                }
            }
            //Her kommer den kun til hvis der kan bokkes alle uger
            if (res.statusCode !== 210) {
                fastbooking.dato = date
                let ids = await bookingDBFunctions.addFastBooking(fastbooking, startDate, slutDate);

                if (ids) {
                    res.status(200)
                    res.end()
                } else {
                    res.status(204)
                    res.end()
                }
            }
        } else {
            res.status(212)
            res.end()
        }
    } else {
        res.status(208)
        res.end()
    }

})

router.post('/eventbooking', async (req, res) => {
    if (req.session.isLoggedIn) {
        if (req.session.isAdmin) {
            const { date, lokaleId, tid, eventNavn, antalDeltagere, slutDato, sluttid } = req.body

            let startDate = new Date();
            startDate.setHours(tid.substring(0, 2));
            startDate.setFullYear(date.substring(0, 4), date.substring(5, 7), date.substring(8, 10))
            startDate.setMonth(startDate.getMonth() - 1)

            let slutDate = new Date();
            slutDate.setHours(sluttid.substring(0, 2));
            slutDate.setFullYear(slutDato.substring(0, 4), slutDato.substring(5, 7), slutDato.substring(8, 10))
            slutDate.setMonth(slutDate.getMonth() - 1)

            let idag = new Date();

            let twoWeeksInMiliseconds = 1209600000;

            let loopdate = new Date(startDate);

            let hasdeleted = false

            let event = { eventNavn: eventNavn, dato: date, tid: tid, antalDeltagere: antalDeltagere }

            let eventBooking = { dato: date, lokaleId: lokaleId, tid: tid, username: eventNavn, isEvent: true }
            let loopBooking = eventBooking

            let done = false;
            let bookinger = await bookingDBFunctions.getBookinger();
            bookinger = bookinger.filter((e) => e.lokaleId == lokaleId)

            if (slutDate.getTime() < startDate.getTime()) {
                res.status(216)
                res.end()
            } else {
                while (!done) {
                    let svar = bookinger.find((e) => {
                        return e.dato == loopBooking.dato && e.tid == loopBooking.tid
                    })
                    if (svar) {
                        if (loopdate.getTime() < (idag.getTime() + twoWeeksInMiliseconds)) {
                            res.status(210)
                            res.end()
                        } else {
                            hasdeleted = await bookingDBFunctions.deleteBooking(svar.docID)
                        }
                    }
                    if (loopdate.getTime() > slutDate.getTime()) {
                        done = true;
                    } else {
                        loopdate.setHours(loopdate.getHours() + 1)
                        loopBooking.tid = loopdate.getHours() + ":00"
                        loopBooking.dato = loopdate.toISOString().slice(0, 10)
                    }
                }
                if (res.statusCode !== 210) {
                    eventBooking.tid = tid
                    let ids = await bookingDBFunctions.addEventBooking(eventBooking, startDate, slutDate);
                    if (ids) {
                        await bookingDBFunctions.addEvent(event)
                        res.status(200).json({hasdeleted: hasdeleted})
                        res.end()
                    } else {
                        res.status(204)
                        res.end()
                    }
                }
            }
        } else {
            res.status(212)
            res.end()
        }
    } else {
        res.status(208)
        res.end()
    }
})

router.get('/:dato/:lokale', async (req, res) => {
    let bookinger = await bookingDBFunctions.getBookingerForUgen(req.params.dato, req.params.lokale);
    res.json(bookinger);
})




export default router;