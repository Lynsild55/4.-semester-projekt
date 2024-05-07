import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  where
} from 'firebase/firestore'

import router from '../routes/profilRoutes.js';
import registreringDBFunctions from "../service/registreringDBFunctions.js";
import loginDBFunctions from "../service/loginDBFunctions.js";

const firebaseConfig = {

  apiKey: "AIzaSyDou4WSQ61qMHdL6G9qu-mwWzVv2Ihp5QE",

  authDomain: "beatfabrikkenreincarnated.firebaseapp.com",

  projectId: "beatfabrikkenreincarnated",

  storageBucket: "beatfabrikkenreincarnated.appspot.com",

  messagingSenderId: "709925552016",

  appId: "1:709925552016:web:a44066f7ef79182794fd15"

};



// Initialize Firebase
const firebase_app = initializeApp(firebaseConfig);
const db = getFirestore(firebase_app);
const brugere = collection(db, 'Bruger')



const updateUser = async (user, oldUsername) => {
  try {
    const existingUser = await loginDBFunctions.getUser(user.username);
    if (existingUser == null || user.username === oldUsername) {
      const userQuerySnapshot = await getDocs(brugere);
      const userDoc = userQuerySnapshot.docs.find(doc => doc.data().username === oldUsername);

      if (userDoc) {
        await updateDoc(doc(db, 'Bruger', userDoc.id), {
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          mobilnummer: user.mobilnummer,
        });
        console.log('User updated successfully');
        return true;
      } else {
        console.log('User not found');
        return false
      }
    } else {
      return false;
    }
  }
  catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

const updatePassword = async (username, newPassword) => {
  const salt = registreringDBFunctions.getSalt();
  const saltArray = registreringDBFunctions.saltStringToUint8Array(salt);
  const hashedNewPassword = await registreringDBFunctions.hashPassword(newPassword, saltArray);

  const userQuerySnapshot = await getDocs(brugere);
  const userDoc = userQuerySnapshot.docs.find(doc => doc.data().username === username);

  if (userDoc) {
    await updateDoc(doc(db, 'Bruger', userDoc.id), {
      password: hashedNewPassword,
      salt: salt
    });
    console.log('Password updated successfully');
  } else {
    console.log('User not found');
  }
}




export default { updateUser, updatePassword };


