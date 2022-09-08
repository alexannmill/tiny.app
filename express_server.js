// ----- Requirements & Setup
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); 

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

// ------- Helper Functions
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
const urlsForUser= (userID) => {
  let userDatabase = {}
  for (const shortID in urlDatabase) {
    if (userID === urlDatabase[shortID].userID) {
        userDatabase[shortID] = urlDatabase[shortID]
    }
  }
  return userDatabase;
};

///----- Home Page
app.get("/", (req, res) => {
  if (!users[req.cookies["user_id"]]){
    res.redirect("/urls/login")
  }else {
    res.redirect("/urls")
  }
});

///----Authentication 
app.get("/urls/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]){
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  };
});

app.post("/urls/login", (req, res) => {
  const {email, password} = req.body
  if (!email || !password) {
    return res.status(400).send("<h1>Invalid Entry.</h1>");
  }
  const user = getUserByEmail(email);
  if (user === null){
    return res.status(403).send("<h1>Invalid Credentials.</h1>");
  };
  const comparePassword = bcrypt.compareSync(password, user.password);
  if (!user || comparePassword ===  false){
    return res.status(403).send("<h1>Invalid Credentials.!!</h1>");
  };
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies["user_id"]);
  res.redirect("/urls");
});

app.get("/urls/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]){
    res.redirect("/urls");
  }else {
    res.render("urls_registration", templateVars);
  };
});

app.post("/urls/register", (req, res) => {
  const {email, password} = req.body
  if (!email || !password) {
    return res.status(400).send("<h1>Error, Invalid Entry.");
  }
  if (getUserByEmail(email) !== null) {
    return res.status(400).send("<h1>Error, User Already Exist.</h1>");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomNumber();
  users[id] = { id, email, password: hashedPassword };
  res.cookie("user_id", id);
  res.redirect("/urls/");
});

// ----- Create
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]){
    res.render("urls_new", templateVars);
  }else {
    res.redirect("/urls/login");
  };
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  if (!users[req.cookies["user_id"]]){
    res.status(403).send("<h1>Error, Login Required.</h1>")
  }
  const userID = templateVars.user.id
  const newUrl = req.body.longURL;
  const shortUrl = generateRandomNumber();
  urlDatabase[shortUrl] = { longURL: newUrl, userID: userID };
  res.redirect(`/urls/${shortUrl}`);
});

// ------- Read All
app.get("/urls", (req, res) => {
  const user= users[req.cookies["user_id"]]
  if(!user) {
    return res.status(403).send("<h1>Error, Login Required.</h1>")
  }
 const userDatabase = urlsForUser(user.id)
  const templateVars = {
    urls: userDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

// ----- Read Individual
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (!user) {
    return res.status(400).send("<h1>Error, Login Required.</h1>")
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id)
  if (!userDatabase[id]) {
   return res.status(400).send("<h1>Error, No URL Found.</h1>")
  }
  const templateVars = {
    id,
    user,
    longURL: urlDatabase[id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL){
    res.status(400).send("<h1>Error, No URL Found.</h1>")
  }
  res.redirect(longURL);
});

// ----- Edit 
app.post("/urls/:id", (req, res) => {
  const user= users[req.cookies["user_id"]]
  if (!user) {
    return res.status(400).send("<h1>Error, Login Required.</h1>")
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id)
  if (!userDatabase[id]) {
    return res.status(400).send("<h1>Error, No URL Found.!!</h1>")
  }
  if (user){
    const longURL = req.body.longURL;
    urlDatabase[id].longURL = longURL;
    return res.redirect("/urls")
  }
});

// ----- Delete
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if (!user) {
    return res.status(400).send("<h1>Error, Login Required.</h1>")
  }
  const id = req.params.id;
  const userDatabase = urlsForUser(user.id)
  if (!userDatabase[id]) {
   return res.status(400).send("<h1>Error, No URL Found.</h1>")
  } else {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});


// ----- Server// Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
