const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/url.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const shortUrl = Math.random().toString(36).substring(2, 8);
  urlDatabase[shortUrl] = newURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/u/:id", (req, res) => {
  longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("url/*/", (req, res) => {
  res.send("404 Page Not Found");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
