async function addHold() {
    document.getElementById('opretHoldForm').addEventListener('submit', function (event) {
        event.preventDefault();
    });
    const inputFields = document.querySelectorAll(".form-control")
    let validationFailed = false
    inputFields.forEach(elem => {
        if (elem.value.trim() === '') {
            validationFailed = true;
            return
        }
    })
    if (!validationFailed) {
        const alder = inputFields[0].value.trim();
        const holdNavn = inputFields[1].value.trim();
        const instruktør = inputFields[2].value.trim();
        const pris = inputFields[3].value.trim();
        let data = { alder: alder, holdNavn: holdNavn, instruktør: instruktør, pris: pris }
        let url = '/admin/opretHold'
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.status == 200) {
            window.location = "/admin";
        } else {
            const usernameInput = document.getElementById("floatingHoldNavn")
            usernameInput.classList.add("is-invalid")
            const holdNavnExistsAlert = document.getElementById("holdNavn-exists")
            holdNavnExistsAlert.classList.remove("visually-hidden")
        }

    }
}

function showHideTab(number) {
    const tab1 = document.getElementById('tab1')
    const tab2 = document.getElementById('tab2')
    switch (number) {
        case 1:
            if (tab1.classList.contains('visually-hidden')) {
                tab1.classList.remove('visually-hidden')
            }
            tab2.classList.add('visually-hidden')
            break;
        case 2:
            if (tab2.classList.contains('visually-hidden')) {
                tab2.classList.remove('visually-hidden')
            }
            tab1.classList.add('visually-hidden')
        default:
            break;
    }
}

async function addBookingToTable(){
    const tableBody = document.querySelector(".booking tbody")
    const lokaleId = document.getElementById("lokaleSelect").value;

    let url = '/admin/bookinger/' + lokaleId;
    const response = await fetch(url)
    const data = await response.json();

    data.forEach(data => {
        const tr = document.createElement('tr');
        tableBody.appendChild(tr);

        tr.insertCell(-1).innerHTML = data.username
        tr.insertCell(-1).innerHTML = data.dato
        tr.insertCell(-1).innerHTML = data.tid
        tr.insertCell(-1).innerHTML = data.lokaleId

        const handling = tr.insertCell(-1)

        let bookingDato = new Date(data.dato + " " + data.tid);
        let nu = new Date();
        
        if(bookingDato >= nu){
        const form = document.createElement('form')
        form.action = '/admin/delete/' + data.docID;
        form.method = 'post'
        handling.appendChild(form);

        const button = document.createElement('button');
        button.type = 'submit';
        button.classList.add('btn','btn-danger')
        button.innerText = 'Annuller';
        button.setAttribute('onclick', "return confirm('Er du sikker på, at du vil slette denne booking?');")
        form.appendChild(button);
        } else {
            handling.innerText = 'Færdig'
        }
    })
}

if (window.location.pathname == '/admin') {
    addBookingToTable()
}