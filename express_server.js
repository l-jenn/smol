const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.set("view engine", "ejs");

const urlDatabase = {
  "sW9gr": {
    longURL: "http://http.cat",
    userId: "meow"
  },
  "4pRZq": {
    longURL: "http://duckduckgo.com",
    userId: "meow"
  },
  "hehechomky": {
    longURL: "http://chonk.cat",
    userId: "nyan"
  },
  "megachonk": {
    longURL: "http://chonwk.cat",
    userId: "meow"
  }
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

  return null;
};

function checkIfUserIsLoggedIn(userId) {
  for (const id in users) {
    if (users[id].id === userId) {
      console.log(users[id].id, userId);
      return true;
    }
  }
  return false;
}

function personalUrls(userId) {
  let personalList = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userId === userId) {
      personalList[id] = (urlDatabase[id]);
    }
  }
  return personalList;
}

// GET /
app.get("/", (req, res) => {
  const userId = req.cookies["userId"];

  if (checkIfUserIsLoggedIn(userId)) {
    return res.redirect("/urls");
  }

  res.redirect("/login");
});

// GET /register
app.get("/register", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {user: users[userId]};

  if (checkIfUserIsLoggedIn(userId)) {
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
  const userId = req.cookies["userId"];
  const templateVars = {user: users[userId]};

  if (checkIfUserIsLoggedIn(userId)) {
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
  const userId = req.cookies["userId"];
  if (!checkIfUserIsLoggedIn(userId)) {
    return res.status(403).send("Please log in.");
  }

  const urls = personalUrls(userId);
  console.log(urls);

  const templateVars = { urls, user: users[req.cookies["userId"]]};
  res.render("urls_index", templateVars);
});

// GET /urls.json (example)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {user: users[userId]};

  if (!checkIfUserIsLoggedIn(userId)) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

// GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Link does not exist.");
  }
  
  const templateVars = { smolURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["userId"]]};
  // currently catches all urls; need to write if/else to catch if it's stored in db
  res.render("urls_show", templateVars);
});

// POST /urls
app.post("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  if (!checkIfUserIsLoggedIn(userId)) {
    return res.status(403).send("Forbidden. Please log in.");
  }

  let shortURL = req.body.alias || generateRandomString();

  urlDatabase[shortURL] = { longURL: req.body.longURL, userId: req.cookies["userId"] };
  
  console.log(urlDatabase);
  
  res.redirect(`/urls/${shortURL}`);
});

// GET /u/:shortURL
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Link does not exist.");
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete POST /urls/:shortURL/delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["userId"];

  if (!checkIfUserIsLoggedIn(userId)) {
    return res.status(403).send("Unauthorized deletion request. Please log in.");
  }

  // if the shortURL key doesn't exist - in other words, doesn't belong to logged in user
  const personalList = personalUrls(userId);
  const shortURL =  req.params.shortURL;
  if (!personalList[shortURL]) {
    return res.status(404).send("You cannot delete this link as you are not the original creator.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// Edit POST /urls/:shortURL
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["userId"];

  if (!checkIfUserIsLoggedIn(userId)) {
    return res.status(403).send("Unauthorized edit request. Please log in.");
  }

  // if the shortURL key doesn't exist - in other words, doesn't belong to logged in user
  const personalList = personalUrls(userId);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  if (!personalList[shortURL]) {
    return res.status(403).send("You cannot edit this link as you are not the original creator.");
  }

  urlDatabase[shortURL].longURL = longURL;
  return res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});