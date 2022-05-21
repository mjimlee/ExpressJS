if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt') // to hash passwords and make sure that the app is secure
const passport = require('passport') // for users in testing
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override') // for logging out
const {MongoClient} = require('mongodb');

async function maindatabase() {
  const uri ="mongodb+srv://mjimlee:qwe123asd345_1@cluster0.plpom.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try{
    await client.connect();

    await createAccount(client, {
      email: "m@email.com",
      password: "pleasework",
      first_name: "m",
      last_name: "lee"
    })

  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}
maindatabase().catch(console.error);

async function createAccount(client, newAccount) {
  const result = await client.db("cofeepython").collection("userDetails").insertOne(newAccount);

  console.log(`New account with the following id: ${result.insertedId} has been created!`);
}

// end of database portion

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

//Static Files
app.use(express.static('/public'));
app.use(express.static(__dirname + 'public/css'))

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.get('/', [
  function (req, res, next) {
    fs.writeFile('/inaccessible-path', 'data', next)
  },
  function (req, res) {
    res.send('OK')
  }
])

app.get('/products', (req, res) => {
  res.render('products.ejs')
})

app.get('/branches', (req, res) => {
  res.render('branches.ejs')
})

app.get('/aboutus', (req, res) => {
  res.render('aboutus.ejs')
})
app.listen(3000)