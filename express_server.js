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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return null;
};
const generateRandomNumber = () => {
  return Math.random().toString(36).substring(2, 8);
};

//hompage
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

//login
app.post("/urls/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(req.body.email);
  if (!email || !password) {
    return res.status(400).send("400 Bad Request");
  }
  if (!user || user.password !== password){
    return res.status(403).send("Forbidden");
  };
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.get("/urls/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  
  res.render("urls_login", templateVars);
});
//logout
app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect("/urls");
});

//registration page
app.get("/urls/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

//registration data form
app.post("/urls/register", (req, res) => {
  const id = generateRandomNumber();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("400 Bad Request");
  }
  if (getUserByEmail(email) !== null) {
    return res.status(400).send("400 Bad Request");
  }
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls/");
});

//page new short URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//page for /shorturl(id)
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("404 Page Not Found");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//adding new long URL
app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const shortUrl = generateRandomNumber();
  urlDatabase[shortUrl] = newURL;
  /// add http:// into feild ////
  res.redirect(`/urls/${shortUrl}`);
});

//form for edit long URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls`);
});

//deleting URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

//redirection for shortID to long url page
app.get("/u/:id", (req, res) => {
  longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
