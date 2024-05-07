async function updateUser() {
    document.getElementById('redigeringsForm').addEventListener('submit', function (event) {
        event.preventDefault();
    });
    const inputFields = document.querySelectorAll('input')
    let validationFailed = false
    inputFields.forEach(elem => {
        if (elem.value.trim() === '') {
            validationFailed = true;
            return
        }
        if (elem.id === 'floatingEmail') {
            const char1 = '@'
            if (!elem.value.includes(char1)) {
                validationFailed = true;
                return
            }
        }
    })
    if (!validationFailed) {
        const username = inputFields[0].value.trim();
        const email = inputFields[1].value.trim();
        const firstName = inputFields[2].value.trim();
        const lastName = inputFields[3].value.trim();
        const mobileNumber = inputFields[4].value.trim();
        let data = { username: username, email: email, firstname: firstName, lastname: lastName, mobilnummer: mobileNumber }
        let url = '/profil/edit';
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.status == 200) {
            window.location = "/profil";
        } else {
            const usernameInput = document.getElementById("floatingUsername")
            usernameInput.classList.add("is-invalid")
            const usernameExistsAlert = document.getElementById("username-exists")
            usernameExistsAlert.classList.remove("visually-hidden")
        }
    }
}