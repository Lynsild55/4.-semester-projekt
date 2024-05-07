async function book() {
    //Fjerner alerts
    document.querySelectorAll('[role="alert"]').forEach((e) => {
        e.classList.add("visually-hidden")
    })


    try {
        if (document.getElementById('btnradio1').checked) {
            await enkeltBook();
        } else if (document.getElementById('btnradio2').checked) {
            await fastBook();
        } else if (document.getElementById('btnradio3').checked) {
            await eventBook();
        }
    } catch (error) {
        await enkeltBook()
    }
}

async function enkeltBook() {
    const date = document.getElementById("datepicker").value;
    const lokaleId = document.getElementById("lokaleSelect").value;
    const tid = document.getElementById("tidSelect").value;
    let idag = new Date();
    let bookDato = new Date();
    bookDato.setHours(tid.substring(0, 2));
    bookDato.setFullYear(date.substring(0, 4), date.substring(5, 7), date.substring(8, 10))
    bookDato.setMonth(bookDato.getMonth() - 1)

    if (bookDato.getTime() < idag.getTime()) {
        const bookingDateFailureAlert = document.getElementById("BookingDateFailureAlert")
        bookingDateFailureAlert.classList.remove("visually-hidden")
    } else {
        let data = { date: bookDato, lokaleId: lokaleId, tid: tid }
        let url = '/booking';
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.status == 200) {
            const bookingOprettetAlert = document.getElementById("BookingSuccessAlert")
            bookingOprettetAlert.classList.remove("visually-hidden")
            clearCalendar()
        } else if (response.status == 208) {
            const bookingLoginFailureAlert = document.getElementById("BookingLoginFailureAlert")
            bookingLoginFailureAlert.classList.remove("visually-hidden")
        } else if (response.status == 210) {
            const bookingFailureAlert = document.getElementById("BookingFailureAlert")
            bookingFailureAlert.classList.remove("visually-hidden")
        }
    }
}

async function fastBook() {
    const date = document.getElementById("datepicker").value;
    const lokaleId = document.getElementById("lokaleSelect").value;
    const tid = document.getElementById("tidSelect").value;
    const hold = document.getElementById('holdSelect').value;
    const slutDato = document.getElementById('datepickerSlut').value;
    let data = { date: date, lokaleId: lokaleId, tid: tid, hold: hold, slutDato: slutDato }
    let url = '/booking/fastbooking';
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })

    if (response.status == 200) {
        const bookingOprettetAlert = document.getElementById("BookingSuccessAlert")
        bookingOprettetAlert.classList.remove("visually-hidden")
        clearCalendar()
    } else if (response.status == 208) {
        const bookingLoginFailureAlert = document.getElementById("BookingLoginFailureAlert")
        bookingLoginFailureAlert.classList.remove("visually-hidden")
    } else if (response.status == 210) {
        const bookingFailureAlert = document.getElementById("BookingFailureAlert")
        bookingFailureAlert.classList.remove("visually-hidden")
    }
}

async function eventBook() {
    const date = document.getElementById("datepicker").value;
    const lokaleId = document.getElementById("lokaleSelect").value;
    const tid = document.getElementById("tidSelect").value;
    const eventNavn = document.getElementById("eventNavn").value;
    const antalDeltagere = document.getElementById("eventDeltagere").value;
    const slutDato = document.getElementById('datepickerSlutEvent').value;
    const sluttid = document.getElementById("sluttidSelect").value;
    let data = { date: date, lokaleId: lokaleId, tid: tid, eventNavn: eventNavn, antalDeltagere: antalDeltagere, slutDato: slutDato, sluttid: sluttid}
    let url = '/booking/eventbooking';
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    })

    const responseData = await response.json();

    if (response.status == 200) {
        const bookingOprettetAlert = document.getElementById("BookingSuccessAlert")
        bookingOprettetAlert.classList.remove("visually-hidden")
        if (responseData.hasdeleted) {
            const bookingDeletedAlert = document.getElementById("BookingDeletedAlert")
        bookingDeletedAlert.classList.remove("visually-hidden")
        }
        clearCalendar()
    } else if (response.status == 208) {
        const bookingLoginFailureAlert = document.getElementById("BookingLoginFailureAlert")
        bookingLoginFailureAlert.classList.remove("visually-hidden")
    } else if (response.status == 210) {
        const bookingFailureAlert = document.getElementById("BookingFailureAlert")
        bookingFailureAlert.classList.remove("visually-hidden")
    } else if (response.status == 216) {
        const bookingDateFailureAlert = document.getElementById("BookingDateFailureAlert")
        bookingDateFailureAlert.classList.remove("visually-hidden")
    }
}

const getPreviousMonday = (date = null) => {
    const prevMonday = date && new Date(date.valueOf()) || new Date()
    prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7)
    return prevMonday
}

if (window.location.pathname == '/booking') {
    document.getElementById('datepicker').valueAsDate = new Date();
    let date = document.getElementById("datepicker").value;
    let getPrevMonday = getPreviousMonday(date).toISOString().slice(0, 10)
    const inputField = document.getElementById("datepicker")
    inputField.addEventListener("input", function () {
        date = document.getElementById("datepicker").value;
        const currentMonday = getPreviousMonday(date).toISOString().slice(0, 10)
        if (currentMonday != getPrevMonday) {
            clearCalendar()
            getPrevMonday = getPreviousMonday(date).toISOString().slice(0, 10)
        }
    });
    updateCalendar()
}

async function updateCalendar() {
    const tbodyTr = document.querySelectorAll(".bookingTable tbody tr")
    const theadTh = document.querySelectorAll(".bookingTable thead th")
    const lokaleId = document.getElementById("lokaleSelect").value;
    const date = document.getElementById("datepicker").value;
    const getPrevMonday = getPreviousMonday(date).toISOString().slice(0, 10);
    const time = document.querySelectorAll(".bookingTable tbody td")

    let url = '/booking/' + getPrevMonday + '/' + lokaleId;
    const response = await fetch(url)
    const data = await response.json();

    for (let i = 0; i < theadTh.length - 1; i++) {
        let currentDay = new Date(getPreviousMonday(date).setDate(getPreviousMonday(date).getDate() + i)).toISOString().slice(0, 10)
        let h = 0
        tbodyTr.forEach(tr => {
            let boxCreated = false
            for (let k = 0; k < data.length; k++) {
                if (data[k].tid === time[h].innerHTML && data[k].dato === currentDay) {
                    const td = tr.insertCell(-1)
                    if (data[k].username == "åben træning") {
                        td.classList.add("text-bg-warning")
                    } else if (data[k].isEvent) {
                        td.classList.add("text-bg-primary")
                    } else {
                        td.classList.add("text-bg-danger")
                    }
                    boxCreated = true
                    break
                }
            }
            if (!boxCreated) {
                const td = tr.insertCell(-1)
                td.classList.add("text-bg-success")
            }
            h++
        });
    }
}

function clearCalendar() {
    const tbodyTr = document.querySelectorAll(".bookingTable tbody tr")
    tbodyTr.forEach(tr => {
        const tds = tr.querySelectorAll("td")
        tds.forEach(td => {
            if (td.innerHTML == '') {
                td.remove()
            }
        })
    })
    updateCalendar()
}

function showHideForm(number) {
    const fastBookForm = document.getElementById('fastBookForm')
    const eventBookForm = document.getElementById('eventBookForm')
    switch (number) {
        case 1:
            fastBookForm.classList.add('visually-hidden')
            eventBookForm.classList.add('visually-hidden')
            break;
        case 2:
            if (fastBookForm.classList.contains('visually-hidden')) {
                fastBookForm.classList.remove('visually-hidden')
            }
            eventBookForm.classList.add('visually-hidden')
            break;
        case 3:
            if (eventBookForm.classList.contains('visually-hidden')) {
                eventBookForm.classList.remove('visually-hidden')
            }
            fastBookForm.classList.add('visually-hidden')
        default:
            break;
    }
}

function clearBookingsFromTable(){
    const tableBody = document.querySelector(".booking tbody")
    tableBody.innerHTML = '';
    addBookingToTable();
}