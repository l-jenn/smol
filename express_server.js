const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "sW9gr": "http://http.cat",
  "4pRZq": "http://duckduckgo.com",
  "hehechomky": "http://chonk.cat",
  "megachonk": "http://chonwk.cat"
};

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

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { smolURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // currently catches all urls; need to write if/else to catch if it's stored in db
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send(`<html><body><center><img src="https://i.imgur.com/Lle1PoO.jpg"></img><p>Figure 1. angy</p></center></body></html>\n`);
});

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});

// also noticing that if i start the connection (node express_server in terminal), and add more keyvalue pairs to urlDatabase, then refresh the browser, the changes aren't retroactive/won't display. i'd need to end connection & reopen it. whereas, for the templating/HTML files, changes ARE retroactive upon browser refresh

// the reason for this is that when i run the server, it moves the code/js into RAM and executes it. the js is stored in the memory & won't "refresh," while the ejs files are static, and so when i refresh the browser, it grabs the latest ver.

// when i get to work w/ webpack dev server, it'll do the end/restart node automatically the moment i modify the js