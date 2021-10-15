const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "sW9gr": "http://http.cat",
  "4pRZq": "http://duckduckgo.com"
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

app.get("/hello", (req, res) => {
  res.send(`<html><body><center><img src="https://i.imgur.com/Lle1PoO.jpg"></img><p>Figure 1. angy</p></center></body></html>\n`);
});

app.listen(PORT, () => {
  console.log(`test - listening on port ${PORT}`);
});