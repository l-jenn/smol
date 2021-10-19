const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({extended: true}));

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // rmb: this object can store simple keys too, not just other objects like the "url database". ex. if it was const templateVars = { greeting: "hello world! "}, you can call it via <% greeting %>.
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'meowmeow?!?' };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { smolURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // currently catches all urls; need to write if/else to catch if it's stored in db
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
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

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});

//up to now, still unhandled are:
// duplicate links
// urls not prefixed with http:// or https:// redirect to undefined
// requests to nonexistent links (via /urls/:shorturl)
// requests to nonexistent links (via /u/:shorturl) redirect to /u/undefined
// -> curl -i will display status 302 Found, but location: undefined
// urlDatabase wipe on server restart