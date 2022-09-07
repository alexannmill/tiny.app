const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

let urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/url.json", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.json(urlDatabase);
});

app.post("/urls/login", (req, res) => {
  const username = req.body.username;
  // console.log(username)
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  const username = req.body.username;
  const templateVars = {
    username: req.cookies["username"],
  };
  res.clearCookie("username", req.cookies["username"]);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // if(!urlDatabase[req.params.id]){
  //   res.send("404 Page Not Found")
  // }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  const templateVars = {
    username: req.cookies["username"],
  };
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const shortUrl = Math.random().toString(36).substring(2, 8);
  urlDatabase[shortUrl] = newURL;
  /// add http:// into feild ////
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  longURL = urlDatabase[req.params.id];
  const templateVars = {
    username: req.cookies["username"],
  };
  res.redirect(longURL, templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
