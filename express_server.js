const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "dfdfdf", 
    email: "lolo@lol.com", 
    password: "purple-monkey-dinosaur"
  },
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  while (string.length < 6) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }

  return string;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: '',
    urls: urlDatabase
  };

  templateVars = addUserToTemplateVars(templateVars, req);
  //templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: '',
    urls: urlDatabase
  };

  templateVars = addUserToTemplateVars(templateVars, req);
  //templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = (req.params.shortURL).substring(1);
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], username: '' };

  templateVars = addUserToTemplateVars(templateVars, req);
  //templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  const longURL = urlDatabase[shortUrl];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  urlDatabase[shortUrl] = req.body["longURL"];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  let emailCheck = false;

  for (let userKey in users) {
    if (users[userKey]['email'] === email) {
      emailCheck = true;
    }
  }

  //The signup form already has 'required' attributes for the email and password but this is just in case.
  if ((email && password !== '') && emailCheck === false) {
    const user = {
      id,
      email,
      password
    };
  
    let ID = user.id;
    users[ID] = user;
    res.cookie('user_id', ID);
    res.redirect('/urls');
  } res.status(404).send("That email is already in use!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const assignCookieUsername = (template, req) => {
  if (req.cookies["username"]) {
    template.username = req.cookies["username"];
  }
  return template;
};

const addUserToTemplateVars = (template, req) => {
  for (let userKey in users) {
    if (userKey === req.cookies["user_id"]) {
      template.user = users[userKey];
    }
  } return template;
};

