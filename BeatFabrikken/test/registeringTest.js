import chai from 'chai';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';
import loginDBFunctions from '../service/loginDBFunctions.js';
import registreringDBFunctions from '../service/registreringDBFunctions.js';

const expect = chai.expect;

//bemærk denne virker kun 1 gang, hvis brugeren ikke er i databasen
describe('addUser Function', () => {
  it('should create a new user in the database', async () => {
    const testUser = {
      username: 'testuser',
      password: 'testpassword',
      firstname: 'test',
      lastname: 'user',
      email: 'test@example.com',
      mobilnummer: '12345678',
      admin: false
    };

    const userId = await registreringDBFunctions.addUser(testUser);

    const addedUser = await loginDBFunctions.getUser(testUser.username)

    expect(addedUser.username).to.equal(testUser.username);
    expect(addedUser.email).to.equal(testUser.email);
    expect(addedUser.mobilnummer).to.equal(testUser.mobilnummer);
    //expect(addedUser.password).to.equal(testUser.password); Vil ikke virke da password bliver krypteret!
  });
});
