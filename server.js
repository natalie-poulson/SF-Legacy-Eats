const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const routes = require('./config');

const db = require('./models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**********
 * ROUTES *
 **********/
app.use(express.static('public'));

//HTML Endpoints
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
})

app.get('/map', (req, res) => {
  res.sendFile(__dirname + '/views/map.html');
})

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/views/about.html');
})

//JSON API Endpoints
app.use('/api', routes.api)
// app.use('/api/heritage', routes.heritage);
// app.use('/api/legacy', routes.legacy);

// app.get('/api/user', (req, res) => {
//   db.User.find( {}, (err, allUsers) => {
//     if(err){console.log(err)};
//     res.json({data: allUsers});
//     })
// });    

// app.post('/api/login' , (req, res) => {
//   var email = req.body.email;
//   var password = req.body.password;

//   db.User.find({email: req.body.email})
//     .exec()
//     .then( users => {
//       if(users.length < 1) {
//         return res.status(401).json({
//           message: "Email/Password incorrect"
//         })
//       }
//       let passCheck = bcrypt.compare(password, users[0].password, (err, match) => {
//         if (err) {
//           console.log('hasing error:', err);
//           return res.status(401).json({message:"Email/Password incorrect"})
//         } 
//         if (match){
//           return res.status(200).json(
//             {message: 'Auth successful'}
//           )
//         }
//       }); 
//     }); 
// });

app.get('/api/heritage', (req, res) => {
  db.Heritage.find( {}, (err, allHeritages) => {
    if(err){console.log(err)};
    res.json({data: allHeritages});
    });
  });

  app.get('/api/heritage/:id' , (req, res) => {
    let heritageId = req.params.id;
    db.Heritage.findById( heritageId , (err, foundHeritage) => {
      if(err) { return console.log(err) };
      res.json(foundHeritage);
    });
  }); 

app.post('/api/legacy' , (req, res) => {
  db.Heritage.find({name: req.body.name})
  .exec()
  .then( heritage => {
    if(heritage.length >= 1) {
      return res.status(401).json({
        message: "heritage exists"
      })
    }
    db.Legacy.find({name: req.body.name}, (err, legacy) => {
          if(err) { return console.log(err) };
          if (legacy.length >= 1) {
            return res.status(401).json({
              message: "legacy already exists"
            })
          }
      else {
        // find a way to grab user id 
        // need to send along with below info from front end

        //find by id. then create leagcy. then push saved legacy into user.legacy.push(savedLegacy)
        const legacy = new db.Legacy({
        name: req.body.name,
        address: req.body.address,
        yearOpened: req.body.yearOpened,
        website:req.body.website,
        coordinates: [parseFloat(req.body.lat),parseFloat(req.body.lon)]
        });

        legacy  
          .save()
          .then (result => {
          res.json({message:'legacy created',
              legacy: result
              })
          })
          .catch ( err => {
            console.log(err);
            res.status(500).json({err})
          })
      }    
    });
  });
});

app.get('/api/legacy', (req, res) => {
  db.Legacy.find( {}, (err, allLegacies) => {
    if(err){console.log(err)};
    res.json({data: allLegacies});
    });
  });

app.get('/api/legacy/:id' , (req, res) => {
  let legacyId = req.params.id;
  db.Legacy.findById( legacyId , (err, foundLegacy) => {
    if(err) { return console.log(err) };
    res.json(foundLegacy);
  });
}); 

// Server
app.listen(process.env.PORT || 3000, () => {
  console.log('Red 5 standing by on http://localhost:3000/');
});
