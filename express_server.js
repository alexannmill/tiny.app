// ----- Requirements & Setup
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomNumber,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["top secret", "where r my keys"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// ------- Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

///----- Home Page
app.get("/", (req, res) => {
  // if logged in ->urls page || if not logged -> login page
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/urls/login");
  }
});

///----Authentication
app.get("/urls/login", (req, res) => {
  // if logged in ->urls page || if not logged -> login page
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/urls/login", (req, res) => {
  //if no entry(s) return 400 err + message
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("<h1>Invalid Entry.</h1>");
  }
  //if email does not match user database return 400 err + message
  const user = getUserByEmail(email, users);
  if (user === null) {
    return res.status(403).send("<h1>Invalid Credentials.</h1>");
  }
  //invalid user or password return 400 err + message
  const comparePassword = bcrypt.compareSync(password, user.password);
  if (!user || comparePassword === false) {
    return res.status(403).send("<h1>Invalid Credentials.!!</h1>");
  }
  //setting cookie + -> urls
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  //removing cookie and -> urls
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

app.post("/urls/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("<h1>Error, Invalid Entry.");
  }
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("<h1>Error, User Already Exist.</h1>");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomNumber();
  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls/");
});

// ----- Create
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login");
  }
});

app.post("/urls", (req, res) => {
  //unable to edit wout login
  const user = users[req.session.user_id];
  if (!users[req.session.user_id]) {
    res.status(403).send("<h1>Error, Login Required.</h1>");
  }
  //setting vars for new url for database
  const userID = user.id;
  const newUrl = req.body.longURL;
  const shortUrl = generateRandomNumber();
  urlDatabase[shortUrl] = { longURL: newUrl, userID };
  res.redirect(`/urls/${shortUrl}`);
});

// ------- Read All
app.get("/urls", (req, res) => {
  //unable to view wout login
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("<h1>Error, Login Required.</h1>");
  }
  //only able to view owned urls
  const userDatabase = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    urls: userDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

// ----- Read Individual
app.get("/urls/:id", (req, res) => {
  //unable to view wout login
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("<h1>Error, Login Required.</h1>");
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id, urlDatabase);
  //only able to view owned urls
  if (!userDatabase[id]) {
    return res.status(404).send("<h1>Error, No URL Found.</h1>");
  }
  const templateVars = {
    id,
    user,
    longURL: urlDatabase[id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  // invalid long url returns 404 err + message
  if (!longURL) {
    res.status(404).send("<h1>Error, No URL Found.</h1>");
  }
  //redirection for all users
  res.redirect(longURL);
});

// ----- Edit
app.post("/urls/:id", (req, res) => {
  //unable to view wout login
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("<h1>Error, Login Required.</h1>");
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id, urlDatabase);
  //only able to view owned urls
  if (!userDatabase[id]) {
    return res.status(404).send("<h1>Error, No URL Found.</h1>");
  }
  //only able to edit owned urls
  if (user) {
    const longURL = req.body.longURL;
    urlDatabase[id].longURL = longURL;
    return res.redirect("/urls");
  }
});

// ----- Delete
app.post("/urls/:id/delete", (req, res) => {
  //unable to delete wout login
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("<h1>Error, Login Required.</h1>");
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id, urlDatabase);
  //only able to delete owned urls
  if (!userDatabase[id]) {
    return res.status(404).send("<h1>Error, No URL Found.</h1>");
  } else {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

// ----- Server// Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
