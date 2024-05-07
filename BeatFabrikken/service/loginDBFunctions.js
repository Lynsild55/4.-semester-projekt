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
import regisreringDBFunctions from './registreringDBFunctions.js';

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

const getUser = async (username) => {
  try {
    const userQuerySnapshot = await getDocs(brugere);
    
    // Find det korrekte dokument baseret på brugernavn
    const userDoc = userQuerySnapshot.docs.find(doc => doc.data().username === username);

    if (userDoc) {
      const user = userDoc.data();
      user.docID = userDoc.id;
      return user;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

async function checkLogInUser(username, password) {
  const user = await getUser(username);
  if (user) {
      const salt = regisreringDBFunctions.saltStringToUint8Array(user.salt)
      const hashedInputPassword = await regisreringDBFunctions.hashPassword(password, salt);
      if (hashedInputPassword === user.password) {
          return true;
      }
  }
  console.log("Forkert kode og navn");
  return false;
}

async function checkIsAdmin(username) {
  const user = await getUser(username);
  if (user) {
    if (user.admin) {
      return true
    }
  }
  return false
}

export default {getUser,checkLogInUser, checkIsAdmin}