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
import loginDBFunctions from './loginDBFunctions.js';

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


const addUser = async (user) => {
    if (await loginDBFunctions.getUser(user.username) == null) {
        user.admin = false
        user.salt = getSalt();
        console.log(user);
        const salt = saltStringToUint8Array(user.salt)
        user.password = await hashPassword(user.password, salt);
        const docRef = await addDoc(brugere, user)
        console.log(docRef.id);
        return docRef.id
    } else {
        return false
    }
}

// Funktion til at hashe adgangskoden med SHA-256
async function hashPassword(password, salt) {
    // Konverterer adgangskoden og saltet til en Uint8Array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltedData = new Uint8Array([...passwordData, ...salt]);

    // Hasher adgangskoden med SHA-256 og saltet
    const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData);

    // Konverterer det hashede resultat til hex-strenge
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    const saltString = Array.from(salt).map(byte => byte.toString(16).padStart(2, '0')).join('');

    // Returnerer både det hashede resultat
    return hashedPassword;
}

function getSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltString = Array.from(salt).map(byte => byte.toString(16).padStart(2, '0')).join('');
    return saltString;
}

function saltStringToUint8Array(saltString) {
    // Deler saltString op i et array af to karakterer og konverterer dem til Uint8Array
    const uint8Array = new Uint8Array(saltString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    return uint8Array;
}

export default { addUser, hashPassword, saltStringToUint8Array, getSalt }