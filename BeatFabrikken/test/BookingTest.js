import chai, { expect } from 'chai';
import supertest from 'supertest';
import appModule from '../app.js';
import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import loginDBFunctions from '../service/loginDBFunctions.js';
import BookingDBFunctions from '../service/BookingDBFunctions.js';
import e from 'express';

const app = appModule.app;
const request = supertest(app);

const assert = chai.assert;

describe('test af booking', () => {
  it('burde oprette en booking', async () => {
    // data for at lave bookningen
    const dato = "2023-11-24"
    const tid = "15:00"
    const booking = {lokaleId: 'Sal 1', dato: dato, tid: tid, username: 'test'}

    supertest(app).post('/login').send({username: 'test', password: 'test'})

    // kald på funktionen der opretter bookningen
    await BookingDBFunctions.addBooking(booking);

    // hent bookningen og tjek om det er korrekt
    const oprettetBooking = await BookingDBFunctions.getBooking(dato, tid, 'Sal 1')

    // Assertions
    expect(oprettetBooking).to.not.be.null;
    expect(oprettetBooking.dato).to.equal(dato);
    expect(oprettetBooking.tid).to.equal(tid);
    expect(oprettetBooking.username).to.equal('test');
  });
});

describe('Booking ikke logget ind', () => {
  it('skal returnere 208, når brugeren ikke er logget ind', (done) => {
    supertest(app)
    .post('/booking')
    .send({ date: '2023-01-01', lokeleId: '1', tid: '10:00' })
    .expect(208)
    .end((err, res) => {
      if(err) return done(err);
      done();
    })
  })
})

describe('getBooking test', () => {
  it('skal finde en eksisterende booking', async () => {
    const expectedDato = '2023-11-24';
    const expectedTid = '15:00';
    const expectedLokaleId = 'Sal 1';

    const booking = await BookingDBFunctions.getBooking(expectedDato, expectedTid, expectedLokaleId);

    expect(booking).to.not.be.undefined;
    expect(booking.dato).to.equal(expectedDato);
    expect(booking.tid).to.equal(expectedTid);
    expect(booking.lokaleId).to.equal(expectedLokaleId)
  });

  it('skal returnere undefined for en ikke-eksisterende booking', async () => {
    const dato = '2024-01-01';
    const tid = '10:00';
    const lokaleId = 'UkendtLokale';

    const booking = await BookingDBFunctions.getBooking(dato, tid, lokaleId);

    expect(booking).to.be.undefined;
  });
});

describe('Delete Booking Test', () => {
  let bookingId;

  before(async () => {
    // Opret en testbooking
    bookingId = await BookingDBFunctions.addBooking({
      dato: '2023-12-12',
      lokaleId: 'Sal 1',
      tid: '10:00',
      username: 'test'
    });
    expect(bookingId).to.not.be.null;
  });

  it('skal slette en eksisterende booking', async () => {
    // Forsøg at slette bookingen
    const deletionResult = await BookingDBFunctions.deleteBooking(bookingId);
    expect(deletionResult).to.be.true;

    // Kontroller, at bookingen er slettet
    const booking = await BookingDBFunctions.getBooking('2023-12-12', '10:00', 'Sal 1');
    expect(booking).to.be.undefined;
  });

  after(async () => {
    // Ryd op (hvis testbookingen ikke blev slettet)
    await BookingDBFunctions.deleteBooking(bookingId);
  });
});

