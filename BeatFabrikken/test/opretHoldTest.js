import chai, { expect } from 'chai';
import supertest from 'supertest';
import appModule from '../app.js';
import { describe, it } from 'mocha';
import request from 'supertest';
import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import administratorDBFunctions from '../service/administratorDBFunctions.js';
import e from 'express';

const app = appModule.app;

const assert = chai.assert;

const adminUser = supertest.agent(app)
await adminUser.post('/login').send({username: 'test', password: 'test'})


describe('test af opret hold', () => {
    it('burde oprette et hold', async () => {
        // Data for at oprette holdet
        const holdData = {
            alder: '13',
            holdNavn: 'TEST HOLD',
            instruktør: 'JAKOB',
            pris: '100'
        };
    
        // Logger ind
        await supertest(app).post('/login').send({username: 'test', password: 'test'})

        // Opret holdet
        //const response = await supertest(app).post('/admin/opretHold').send({holdData});
        await administratorDBFunctions.addHold(holdData)

        // Hent holdet og tjek om det er korrekt
        const oprettetHold = await administratorDBFunctions.getHold(holdData.holdNavn);

        // Assertions
        //expect(response.status).to.equal(200);
        expect(oprettetHold).to.not.be.null;
        expect(oprettetHold.holdNavn).to.equal(holdData.holdNavn);
    });
});


describe('Holdet er allerede oprettet', () => {
    it('skal returnere 210, hvis holdnavnet allerede eksisterer', (done) => {
        const holdData = {
            alder: '13',
            holdNavn: 'TEST HOLD',
            instruktør: 'JAKOB',
            pris: '100'
        };

        adminUser
            .post('/admin/opretHold')
            .send(holdData)
            .expect(210)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });
});

