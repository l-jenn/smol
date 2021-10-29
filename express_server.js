const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "sW9gr": "http://http.cat",
  "4pRZq": "http://duckduckgo.com",
  "hehechomky": "http://chonk.cat",
  "megachonk": "http://chonwk.cat"
};

const users = {
  'meow': {
    id: 'meow',
    email: 'hi@me.com',
    password: '123'
  },
  'nyan': {
    id: 'nyan',
    email: 'hehe@me.com',
    password: '321'
  }
};

function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 5;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * chars.length);
    randomString += chars[randomNum];
  }

  return randomString;
}

const checkUserByEmail = (email) => {
  // if find user, return user

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }

  // if none, return null
  return null;
};

// GET /register
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["userId"]]};

  if (req.cookies["userId"]) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

// POST /register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if neither are filled return 400
  if (!email || !password) {
    return res.status(400).send('both fields must not be blank');
  }

  // if email is taken, return 400
  const user = checkUserByEmail(email);

  if (user) {
    return res.status(400).send('email already taken');
  }

  // if all is good, append these to users db. also, gen user id
  const userId = generateRandomString();

  users[userId] = { id: userId, email, password};
  console.log(users);

  res.cookie('userId', userId);
  res.redirect("/urls");
});

// GET /login
app.get("/login", (req, res) => {

  const templateVars = {user: users[req.cookies["userId"]]};

  if (req.cookies["userId"]) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

// Add POST /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("both fields must not be blank");
  }

  // check if not user
  const user = checkUserByEmail(email);

  if (!user) {
    return res.status(400).send("user doesn't exist");
  }

  if (user.password !== password) {
    return res.status(400).send("incorrect login credentials");
  }

  res.cookie("userId", user.id);

  res.redirect("/urls");
});

// Delete POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect("/login");
});

// GET /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["userId"]]};
  res.render("urls_index", templateVars);
});

// GET /urls.json (example)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["userId"]]};
  res.render("urls_new", templateVars);
});

// GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { smolURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["userId"]]};
  // currently catches all urls; need to write if/else to catch if it's stored in db
  res.render("urls_show", templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  let shortURL = "";

  if (req.body.alias !== "") {
    shortURL = req.body.alias;
  } else {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  
  res.redirect(`/urls/${shortURL}`);
});

// GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Delete POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL =  req.params.shortURL;

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

// Edit POST /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;

  urlDatabase[shortURL] = newURL;

  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});