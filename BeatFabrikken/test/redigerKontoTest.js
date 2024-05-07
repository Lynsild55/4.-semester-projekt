import chai, { expect } from 'chai';
import { getFirestore, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import profileDBFunctions from '../service/profileDBFunctions.js';
import loginDBFunctions from '../service/loginDBFunctions.js';

const assert = chai.assert;

describe('test redigerProfil ', () => {
  it('should update user information', async () => {
    const usernameToUpdate = 'testupdateuser';
    const newUsername = 'testupdateuser2';

    // Get the initial user data
    const initialUserData = await loginDBFunctions.getUser(usernameToUpdate);

    // Define the new information to update
    const newUserData = {
        username: 'testupdateuser2',
        email: 'newtestUpdateUser@gmail.com',
        firstname: 'newUpdate',
        lastname: 'newUser', 
        mobilnummer: '87654321',
    };

    // Call the function to edit the user
    await profileDBFunctions.updateUser(newUserData, usernameToUpdate);

    // Retrieve the user again to check if the information has been updated
    const updatedUserData = await loginDBFunctions.getUser(newUsername);

    // Assertions
    expect(updatedUserData).to.not.be.null;
    expect(updatedUserData.username).to.equal(newUserData.username);
    expect(updatedUserData.email).to.equal(newUserData.email);
    expect(updatedUserData.firstname).to.equal(newUserData.firstname);
    expect(updatedUserData.lastname).to.equal(newUserData.lastname);
    expect(updatedUserData.mobilnummer).to.equal(newUserData.mobilnummer);
  });
});




describe('reverting testupdateuser ', () => {
  it('should update user information', async () => {
    // Assuming there's an existing user with the username 'testuser'
    const usernameToUpdate = 'testupdateuser2';
    const newUsername = 'testupdateuser';

    // Get the initial user data
    const initialUserData = await loginDBFunctions.getUser(usernameToUpdate);

    // Define the new information to update
    const newUserData = {
        username: 'testupdateuser',
        email: 'testUpdateUser@gmail.com',
        firstname: 'Update',
        lastname: 'User', 
        mobilnummer: '12345678',
    };

    // Call the function to edit the user
    await profileDBFunctions.updateUser(newUserData, usernameToUpdate);

    // Retrieve the user again to check if the information has been updated
    const updatedUserData = await loginDBFunctions.getUser(newUsername);

    // Assertions
    expect(updatedUserData).to.not.be.null;
    expect(updatedUserData.username).to.equal(newUserData.username);
    expect(updatedUserData.email).to.equal(newUserData.email);
    expect(updatedUserData.firstname).to.equal(newUserData.firstname);
    expect(updatedUserData.lastname).to.equal(newUserData.lastname);
    expect(updatedUserData.mobilnummer).to.equal(newUserData.mobilnummer);
  });
});
