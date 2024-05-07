import express from "express";
import loginDBFunctions from "../service/loginDBFunctions.js"
import profileDBFunctions from "../service/profileDBFunctions.js";
import BookingDBFunctions from "../service/BookingDBFunctions.js";


const router = express.Router();

//-------------------------------------------------------------------------------------//

// Route til at vise brugerprofilen, hvis brugeren er logget ind.
router.get('/', async (req, res) => {
  if (req.session.isLoggedIn) {
      const username = req.session.username;
      const user = await loginDBFunctions.getUser(username);
      if (user) {
          res.render('profil', { 
              title: 'Profil', 
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              mobilnummer: user.mobilnummer
          });
      } else {
          res.redirect('/login');
      }
  } else {
      res.redirect('/login');
  }
});

//-------------------------------------------------------------------------------------//

// Route til at vise redigeringsformularen for brugerprofilen.
router.get('/edit', async (req, res) => {
  if (req.session.isLoggedIn) {
      const username = req.session.username;
      const user = await loginDBFunctions.getUser(username);
      if (user) {
          res.render('editProfile', {
              title: 'Rediger Profil',
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              mobilnummer: user.mobilnummer
          });
      } else {
          res.redirect('/login');
      }
  } else {
      res.redirect('/login');
  }
});

//-------------------------------------------------------------------------------------//

//route til opdatering af siden og databasen
router.put('/edit', async (req, res) => {
    if (req.session.isLoggedIn) {
      const oldUsername = req.session.username;
      const { username, email, firstname, lastname, mobilnummer } = req.body;

      let user = { username: username, email: email, firstname: firstname, lastname: lastname, mobilnummer: mobilnummer };
  
      try {
        const updatedUser = await profileDBFunctions.updateUser(user, oldUsername);
        if (updatedUser) {
           if (oldUsername !== username) {
          req.session.username = username;
        }
  
        req.session.successMsg = 'Dine ændringer er blevet gemt.';
        res.status(200)
        res.end()
        } else {
          res.status(204)
          res.end()
        }
      
      } catch (error) {
        req.session.errorMsg = 'Der opstod en fejl under opdateringen.';
        res.redirect('/profil/edit');
      }
    } else {
      res.redirect('/login');
    }
  });
  

//-------------------------------------------------------------------------------------//

router.get('/editPassword', async (req, res) => {
  if(req.session.isLoggedIn){
    res.render('editPassword', {title: 'Ændre Password'});
  } else {
    res.redirect('/login')
  }
});

//-------------------------------------------------------------------------------------//

router.post('/editPassword', async (req, res) => {
  if (req.session.isLoggedIn) {
    const username = req.session.username
    const {newPassword, confirmNewPassword} = req.body
    if (newPassword === confirmNewPassword) {
      try {
        await profileDBFunctions.updatePassword(username, newPassword)

        req.session.successMsg = 'Dine ændringer er blevet gemt.';
        res.redirect('/profil');
      } catch (error) {
        req.session.errorMsg = 'Der opstod en fejl under opdateringen.';
        res.redirect('/profil/editPassword');
      }
    } else {
      res.redirect('/profil/editPassword');
    }
  } else {
    res.redirect('/login');
  }
})

//-------------------------------------------------------------------------------------//

router.get('/manageBookings', async (req, res) => {
  if (req.session.isLoggedIn) {
    const username = req.session.username;
    try {
      const user = await loginDBFunctions.getUser(username);
      if (user) {
        const bookinger = await BookingDBFunctions.getBookingerByUser(user.username); // Antaget funktion
        res.render('manageBookings', { 
            title: 'Mine Bookinger', 
            bookinger: bookinger
        });
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error('Fejl ved hentning af bookinger:', error);
      res.redirect('/profil');
    }
  } else {
    res.redirect('/login');
  }
});

//-------------------------------------------------------------------------------------//

router.post('/manageBookings/delete/:bookingId', async (req, res) => {
  if (req.session.isLoggedIn) {
    const bookingId = req.params.bookingId;
    const deleted = await BookingDBFunctions.deleteBooking(bookingId);
    if (deleted) {
      res.redirect('/profil/manageBookings'); // Redirect tilbage til booking management side
    } else {
      res.status(500).send('Kunne ikke slette bookingen');
    }
  } else {
    res.redirect('/login');
  }
});

export default router;