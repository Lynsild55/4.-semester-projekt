import chai, { expect } from 'chai';
import supertest from 'supertest';
import appModule from '../app.js';
import { describe, it } from 'mocha';
import request from 'supertest';
import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import bookingDBFunctions from '../service/BookingDBFunctions.js';
import e from 'express';

const app = appModule.app;

const assert = chai.assert;

const adminUser = supertest.agent(app)
await adminUser.post('/login').send({username: 'test', password: 'test'})


describe('test af opret fast booking', () => {
    it('burde oprette en fast booking over tre uger', async () => {


        let startDato = '2023-12-10'

        let slutDato = '2023-12-24'

        const bookingData = {
            date: startDato,
            lokaleId: 'Sal 2',
            tid: '09:00',
            hold: 'test',
            slutDato: slutDato
        };

        const bookingData1 = {dato: '2023-12-10',lokaleId: 'Sal 2',tid: '09:00',username: 'test'};
        const bookingData2 = {dato: '2023-12-17',lokaleId: 'Sal 2',tid: '09:00',username: 'test'};
        const bookingData3 = {dato: '2023-12-24',lokaleId: 'Sal 2',tid: '09:00',username: 'test'};
        

        // Hent bookinger og tjek
        const fastBooking1 = await bookingDBFunctions.getBooking('2023-12-10', '09:00', 'Sal 2');
        const fastBooking2 = await bookingDBFunctions.getBooking('2023-12-17', '09:00', 'Sal 2');
        const fastBooking3 = await bookingDBFunctions.getBooking('2023-12-24', '09:00', 'Sal 2');

        if (fastBooking1) {
            await bookingDBFunctions.deleteBooking(fastBooking1.docID)
            await bookingDBFunctions.deleteBooking(fastBooking2.docID)
            await bookingDBFunctions.deleteBooking(fastBooking3.docID)
        }

        await adminUser.post('/booking/fastbooking').send(bookingData).expect(200);
        //await bookingDBFunctions.addFastBooking(bookingData, bookingData.startDato, slutDato)

        // Assertions
        //expect(response.status).to.equal(200);
        expect(fastBooking1).to.not.be.null;
        expect(fastBooking1.dato).to.equal(bookingData1.dato);
        expect(fastBooking1.lokaleId).to.equal(bookingData1.lokaleId);
        expect(fastBooking1.tid).to.equal(bookingData1.tid);

        expect(fastBooking2).to.not.be.null;
        expect(fastBooking2.dato).to.equal(bookingData2.dato);
        expect(fastBooking2.lokaleId).to.equal(bookingData3.lokaleId);
        expect(fastBooking2.tid).to.equal(bookingData2.tid);

        expect(fastBooking3).to.not.be.null;
        expect(fastBooking3.dato).to.equal(bookingData3.dato);
        expect(fastBooking3.lokaleId).to.equal(bookingData3.lokaleId);
        expect(fastBooking3.tid).to.equal(bookingData3.tid);
    });
});

describe('test af åbentræning tilføjelser', () => {
    it('skal tillade en admin at oprette fast bookinger med åbentræning', async () => {
        const bookingData = {
            date: '2024-06-10',
            lokaleId: 'Sal 1',
            tid: '09:00',
            hold: 'Åben træning',
            slutDato: '2024-06-24'
        };

        const bookingData1 = {dato: '2024-06-10',lokaleId: 'Sal 1',tid: '09:00', hold: 'Åben træning'};
        const bookingData2 = {dato: '2024-06-17',lokaleId: 'Sal 1',tid: '09:00', hold: 'Åben træning'};
        const bookingData3 = {dato: '2024-06-24',lokaleId: 'Sal 1',tid: '09:00', hold: 'Åben træning'};

        const fastBooking1 = await bookingDBFunctions.getBooking('2024-06-10', '09:00', 'Sal 1');
        const fastBooking2 = await bookingDBFunctions.getBooking('2024-06-17', '09:00', 'Sal 1');
        const fastBooking3 = await bookingDBFunctions.getBooking('2024-06-24', '09:00', 'Sal 1');

        if(fastBooking1) {
        await bookingDBFunctions.deleteBooking(fastBooking1.docID)
        await bookingDBFunctions.deleteBooking(fastBooking2.docID)
        await bookingDBFunctions.deleteBooking(fastBooking3.docID)
        }

        const response = await adminUser.post('/booking/fastbooking').send(bookingData);
        expect(response.status).to.equal(200);
        
        
        expect(fastBooking1).to.not.be.null;
        expect(fastBooking1.dato).to.equal(bookingData1.dato);
        expect(fastBooking1.lokaleId).to.equal(bookingData1.lokaleId);
        expect(fastBooking1.tid).to.equal(bookingData1.tid);

        expect(fastBooking2).to.not.be.null;
        expect(fastBooking2.dato).to.equal(bookingData2.dato);
        expect(fastBooking2.lokaleId).to.equal(bookingData3.lokaleId);
        expect(fastBooking2.tid).to.equal(bookingData2.tid);

        expect(fastBooking3).to.not.be.null;
        expect(fastBooking3.dato).to.equal(bookingData3.dato);
        expect(fastBooking3.lokaleId).to.equal(bookingData3.lokaleId);
        expect(fastBooking3.tid).to.equal(bookingData3.tid);

    });
});

describe('fast booking hvor nogle af tiderne i midten er booket i forvejen', () => {
    it('burde ikke at kunne oprette fast booking, men få en status kode', async () => {


        let startDato = '2023-12-20' //ledig tid på den dag

        let slutDato = '2024-01-03'

        const bookingData = {
            date: startDato,
            lokaleId: 'Sal 2',
            tid: '18:00',
            hold: 'test',
            slutDato: slutDato
        };

        const bookingData1 = {dato: '2023-12-20',lokaleId: 'Sal 2',tid: '18:00',username: 'test'};
        const bookingData2 = {dato: '2023-12-27',lokaleId: 'Sal 2',tid: '18:00',username: 'test'}; //alerede oprettet booking
        const bookingData3 = {dato: '2023-01-03',lokaleId: 'Sal 2',tid: '18:00',username: 'test'};
        

        // Hent bookinger og tjek
        const fastBooking1 = await bookingDBFunctions.getBooking('2023-12-20', '18:00', 'Sal 2');
        const fastBooking2 = await bookingDBFunctions.getBooking('2023-12-27', '18:00', 'Sal 2'); //alerede oprettet booking
        const fastBooking3 = await bookingDBFunctions.getBooking('2023-01-03', '18:00', 'Sal 2');

        /*
        await bookingDBFunctions.deleteBooking(fastBooking1.docID)
        await bookingDBFunctions.deleteBooking(fastBooking2.docID)
        await bookingDBFunctions.deleteBooking(fastBooking3.docID)
        */

        await adminUser.post('/booking/fastbooking').send(bookingData).expect(210);
        //await bookingDBFunctions.addFastBooking(bookingData, bookingData.startDato, slutDato)

        // Assertions
        //expect(response.status).to.equal(200);
        expect(fastBooking1).to.be.undefined;

        expect(fastBooking2).to.not.be.null;
        expect(fastBooking2.dato).to.equal(bookingData2.dato);
        expect(fastBooking2.lokaleId).to.equal(bookingData2.lokaleId);
        expect(fastBooking2.tid).to.equal(bookingData2.tid);

        expect(fastBooking3).to.be.undefined;
    });
});
