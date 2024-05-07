import chai, { assert } from 'chai';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import loginDBFunctions from '../service/loginDBFunctions.js';

const expect = chai.expect;


describe('getUser Function', () => {
  it('should retrieve a user by username', async () => {
    
    // Hent brugeren fra databasen
    const retrievedUser = await loginDBFunctions.getUser('test');

    expect(retrievedUser).to.not.be.null;
    expect(retrievedUser.username).to.equal('test');
    expect(retrievedUser.email).to.equal('test@test.com');
    expect(retrievedUser.mobilnummer).to.equal('12345678');
  });
});

describe('checkLoginUser Function', ()=>{
  it('Should return true if a user with the given password exists', async ()=>{
    const userExistsWithPass = await loginDBFunctions.checkLogInUser('test', 'test')

    expect(userExistsWithPass).to.be.true
  })
})

