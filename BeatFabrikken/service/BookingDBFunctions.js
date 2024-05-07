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
const lokalerCollection = collection(db, 'Lokaler')
const bookingCollection = collection(db, 'Bookinger')
const eventCollection = collection(db, 'Events')

async function getLokale(lokaleID) {
  const docRef = doc(db, 'Lokaler', lokaleID)
  const lokaleQueryDoc = await getDoc(docRef)
  let lokale = lokaleQueryDoc.data()
  lokale.docID = lokaleQueryDoc.id
  return lokale
}

async function getLokaler() {
  let lokalerQueryDocs = await getDocs(lokalerCollection)
  let lokaler = lokalerQueryDocs.docs.map(doc => {
    let data = doc.data()
    data.docID = doc.id
    return data
  })
  return lokaler
}

async function addBooking(booking) {
  let dato = new Date(booking.dato);
  booking.dato = dato.toISOString().slice(0, 10)
  const docRef = await addDoc(bookingCollection, booking)
  return docRef.id
}



async function getBookinger() {
  let bookingQueryDocs = await getDocs(bookingCollection)
  let bookinger = bookingQueryDocs.docs.map(doc => {
    let data = doc.data()
    data.docID = doc.id
    return data
  })
  return bookinger
}

async function getBookingForEnDag(dato, lokale) {
  let bookingQueryDocs = await getDocs(bookingCollection);

  let bookinger = bookingQueryDocs.docs
    .map(doc => {
      let data = doc.data();
      if (data) {
        data.docID = doc.id;
        return data;
      }
      return null; // Hvis data er undefined, returner null
    })
    .filter(data => data && data.dato === dato && data.lokaleId === lokale);

  return bookinger;
}
//console.log(await getBookingForEnDag("2023-11-25", "Sal 1"))

async function getBookingerForUgen(mandagsDato, lokale) {
  let mandag = new Date(mandagsDato); // Parse the input date
  let result = [];

  for (let i = 0; i < 7; i++) {
    let currentDay = new Date(mandag); // Create a new date object to avoid modifying the original date
    currentDay.setDate(mandag.getDate() + i);

    // Fetch bookings for the current day
    let bookingsForDay = await getBookingForEnDag(currentDay.toISOString().slice(0, 10), lokale);

    // Concatenate the array of bookings to the result array
    result = result.concat(bookingsForDay);
  }

  return result;
}
//console.log(await getBookingerForUgen("2023-11-20", "Sal 1"))


async function getBooking(dato, tid, lokaleId) {
  try {
    let bookingQueryDocs = await getDocs(bookingCollection)
    const bookingDoc = bookingQueryDocs.docs.find(doc => doc.data().dato === dato && doc.data().tid === tid && doc.data().lokaleId === lokaleId)
    if (bookingDoc) {
      const booking = bookingDoc.data()
      booking.docID = bookingDoc.id
      return booking
    } else {
      console.log('Booking not found')
      return undefined
    }
  } catch (error) {
    console.error('Error getting booking', error)
    return undefined
  }
}

async function getBookingerByUser(username) {
  let bookingQueryDocs = await getDocs(bookingCollection);
  let idag = new Date();
  idag.setHours(0, 0, 0, 0);

  let userBookinger = bookingQueryDocs.docs
    .map(doc => {
      let data = doc.data();
      if (data && data.username === username) {
        data.docID = doc.id;

        let bookingDato = new Date(data.dato);
        data.erFremtidig = bookingDato >= idag;

        return data;
      }
      return null; // Hvis data er undefined, returner null
    })
    .filter(booking => booking !== null)

  userBookinger.sort((a, b) => new Date(a.dato) - new Date(b.dato) || a.tid.localeCompare(b.tid));

  return userBookinger;
}

//vi skal teste deleteBooking


async function deleteBooking(bookingId) {
  try {
    const docRef = doc(db, 'Bookinger', bookingId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting booking', error);
    return false;
  }
}

async function addFastBooking(fastBooking, startDate, slutDate) {
  let res = [];
  let done = false

  while (!done) {
    if (startDate.getTime() > slutDate.getTime()) {
      done = true;
    } else {
      res.push(await addBooking(fastBooking));
      startDate.setDate(startDate.getDate() + 7)
      fastBooking.dato = startDate
    }
  }
  return res;
}

async function addEventBooking(eventBooking, startDate, slutDate) {
  let res = [];
  let done = false

  while (!done) {
    if (startDate.getTime() > slutDate.getTime()) {
      done = true;
    } else {
      res.push(await addBooking(eventBooking));
      eventBooking.dato = startDate
      startDate.setHours(startDate.getHours() + 1)
      eventBooking.tid = startDate.getHours() + ":00"
    }
  }
  return res;
}

async function addEvent(event) {
  const docRef = await addDoc(eventCollection, event)
  return docRef.id
}

async function getBookingForLokale(lokaleId) {
  try {
    let bookingQueryDocs = await getDocs(bookingCollection);
    let bookingerForLokale = bookingQueryDocs.docs
    .map(doc => {
      let data = doc.data();
      if(data && data.lokaleId === lokaleId) {
        data.docID = doc.id;
        return data;
      }
      return null;
    })
    .filter(booking => booking !== null);

    bookingerForLokale.sort((a, b) => new Date(a.dato) - new Date(b.dato) || a.tid.localeCompare(b.tid));

    return bookingerForLokale;
  } catch (error) {
    console.error('Fejl ved hentning af bookinger for lokaler')
    return [];
  }
}

export default { getLokale, getLokaler, addBooking, getBookinger, getBookingerForUgen, getBooking, getBookingerByUser, deleteBooking, addFastBooking, addEventBooking, getBookingForLokale, addEvent }