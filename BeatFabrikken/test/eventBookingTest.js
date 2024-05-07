import chai, { expect } from 'chai';
import supertest from 'supertest';
import appModule from '../app.js';
import bookingDBFunctions from '../service/BookingDBFunctions.js';
import { response } from 'express';

const app = appModule.app;
const request = supertest(app);
const assert = chai.assert;

const adminUser = supertest.agent(app)
await adminUser.post('/login').send({username: 'test', password: 'test'})
const user = supertest.agent(app)
await user.post('/login').send({username: 'test2', password: 'test2'})


describe('test af event booking via DB', () => {
    it('burde oprette en event', async () => {
        // data for at lave bookningen
        const date = "2024-01-20"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const slutDato = "2024-01-20"
        const sluttid = "22:00"

        let startDate = new Date();
        startDate.setHours(tid.substring(0, 2));
        startDate.setFullYear(date.substring(0, 4), date.substring(5, 7), date.substring(8, 10))
        startDate.setMonth(startDate.getMonth() - 1)

        let slutDate = new Date();
        slutDate.setHours(sluttid.substring(0, 2));
        slutDate.setFullYear(slutDato.substring(0, 4), slutDato.substring(5, 7), slutDato.substring(8, 10))
        slutDate.setMonth(slutDate.getMonth() - 1)
      
        let eventBooking = { dato: date, lokaleId: lokaleId, tid: tid, username: eventNavn, isEvent: true }
  
        // kald på funktionen der opretter bookningen
        await bookingDBFunctions.addEventBooking(eventBooking, startDate, slutDate);
    
        // hent bookningen og tjek om det er korrekt
        const oprettetBooking20 = await bookingDBFunctions.getBooking(date, tid, lokaleId)
        const oprettetBooking21 = await bookingDBFunctions.getBooking(date, "21:00", lokaleId)
        const oprettetBooking22 = await bookingDBFunctions.getBooking(date, "22:00", lokaleId)

        // Assertions
        // 20
        expect(oprettetBooking20).to.not.be.null;
        expect(oprettetBooking20.dato).to.equal(date);
        expect(oprettetBooking20.tid).to.equal("20:00");
        // 21
        expect(oprettetBooking21).to.not.be.null;
        expect(oprettetBooking21.dato).to.equal(date);
        expect(oprettetBooking21.tid).to.equal("21:00");
        // 22
        expect(oprettetBooking22).to.not.be.null;
        expect(oprettetBooking22.dato).to.equal(date);
        expect(oprettetBooking22.tid).to.equal("22:00");

        // Ryd op i DB
        await bookingDBFunctions.deleteBooking(oprettetBooking20.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking21.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking22.docID)
    });
  });

  describe('test af event booking post route', () => {
    it('burde oprette en event', async () => {
        // data for at lave bookningen
        const date = "2024-01-21"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2024-01-21"
        const sluttid = "22:00"

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // kald på route der opretter bookningen
        await adminUser.post('/booking/eventbooking').send(payload).expect(200)

        // hent bookningen og tjek om det er korrekt
        const oprettetBooking20 = await bookingDBFunctions.getBooking(date, tid, lokaleId)
        const oprettetBooking21 = await bookingDBFunctions.getBooking(date, "21:00", lokaleId)
        const oprettetBooking22 = await bookingDBFunctions.getBooking(date, "22:00", lokaleId)

        // Assertions
        // 20
        expect(oprettetBooking20).to.not.be.null;
        expect(oprettetBooking20.dato).to.equal(date);
        expect(oprettetBooking20.tid).to.equal("20:00");
        // 21
        expect(oprettetBooking21).to.not.be.null;
        expect(oprettetBooking21.dato).to.equal(date);
        expect(oprettetBooking21.tid).to.equal("21:00");
        // 22
        expect(oprettetBooking22).to.not.be.null;
        expect(oprettetBooking22.dato).to.equal(date);
        expect(oprettetBooking22.tid).to.equal("22:00");

        // Ryd op i DB
        await bookingDBFunctions.deleteBooking(oprettetBooking20.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking21.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking22.docID)
    });
    it('burde oprette en event og fjerne oprettet booking', async () => {
        // data for at lave bookningen
        const date = "2024-01-21"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2024-01-21"
        const sluttid = "22:00"

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // Opretter booking der skal slettes
        const booking = { dato: date, lokaleId: lokaleId, tid: "21:00", username: "test" }
        await bookingDBFunctions.addBooking(booking);

        // kald på route der opretter bookningen
        const response = await adminUser.post('/booking/eventbooking').set('Content-type', 'application/json').send(payload).expect(200)

        // hent bookningen og tjek om det er korrekt
        const oprettetBooking20 = await bookingDBFunctions.getBooking(date, tid, lokaleId)
        const oprettetBooking21 = await bookingDBFunctions.getBooking(date, "21:00", lokaleId)
        const oprettetBooking22 = await bookingDBFunctions.getBooking(date, "22:00", lokaleId)

        // Assertions
        // At der er blevet slettet en booking
        expect(response.body.hasdeleted).to.equal(true)
        // 20
        expect(oprettetBooking20).to.not.be.null;
        expect(oprettetBooking20.dato).to.equal(date);
        expect(oprettetBooking20.tid).to.equal("20:00");
        // 21
        expect(oprettetBooking21).to.not.be.null;
        expect(oprettetBooking21.dato).to.equal(date);
        expect(oprettetBooking21.tid).to.equal("21:00");
        // 22
        expect(oprettetBooking22).to.not.be.null;
        expect(oprettetBooking22.dato).to.equal(date);
        expect(oprettetBooking22.tid).to.equal("22:00");
        
        // Ryd op i DB
        await bookingDBFunctions.deleteBooking(oprettetBooking20.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking21.docID)
        await bookingDBFunctions.deleteBooking(oprettetBooking22.docID)
    });
    it('burde fejle uden login ved at oprette en event', async () => {
        // data for at lave bookningen
        const date = "2024-01-21"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2024-01-21"
        const sluttid = "22:00"

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // kald på route der opretter bookningen
        await request.post('/booking/eventbooking').send(payload).expect(208)
    });
    it('burde fejle admin login ved at oprette en event', async () => {
        // data for at lave bookningen
        const date = "2024-01-21"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2024-01-21"
        const sluttid = "22:00"

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // kald på route der opretter bookningen
        await user.post('/booking/eventbooking').send(payload).expect(212)
    });
    it('burde fejle ved at slutdato er før startdato oprette en event', async () => {
        // data for at lave bookningen
        const date = "2024-01-22"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2024-01-21"
        const sluttid = "22:00"

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // kald på route der opretter bookningen
        await adminUser.post('/booking/eventbooking').send(payload).expect(216)
    });
    it('burde fejle ved oprette en event som sletter en booking der er under 2 uger til', async () => {
        // data for at lave bookningen
        const date = "2023-12-05"
        const tid = "20:00"
        const lokaleId = "Sal 2"
        const eventNavn = "Testing event"
        const antalDeltagere = 25
        const slutDato = "2023-12-05"
        const sluttid = "22:00"

        const booking = { dato: date, lokaleId: lokaleId, tid: "21:00", username: "test" }
        await bookingDBFunctions.addBooking(booking);

        const payload = {date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
        
        // kald på route der opretter bookningen
        await adminUser.post('/booking/eventbooking').send(payload).expect(210)

        // Ryd op i DB
        const oprettetBooking = await bookingDBFunctions.getBooking(date, "21:00", lokaleId)
        await bookingDBFunctions.deleteBooking(oprettetBooking.docID)
    });
  });