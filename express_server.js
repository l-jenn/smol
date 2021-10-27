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

// GET /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// GET /urls.json (example)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { smolURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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

// Add POST /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

// Delete POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});