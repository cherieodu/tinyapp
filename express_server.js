const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {};

const users = {};

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
    urls: urlDatabase
  };

  templateVars = addUserToTemplateVars(templateVars, req);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  if (req.cookies['user_id']) {
    let templateVars = {
      urls: urlDatabase
    };
  
    templateVars = addUserToTemplateVars(templateVars, req);
    res.render("urls_new", templateVars);
    return;
  }

  res.redirect('/login');

  
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = (req.params.shortURL).substring(1);
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL]['longURL']};
  

  templateVars = addUserToTemplateVars(templateVars, req);
  urlsArray = urlsForUser(req.cookies['user_id']);
  templateVars.urls = urlsArray;
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  const longURL = urlDatabase[shortUrl]['longURL'];
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
  urlDatabase[shortURL] = {longURL: req.body["longURL"], userID: req.cookies['user_id']};
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  urlDatabase[shortUrl] = {longURL: req.body["longURL"], userID: req.cookies['user_id']};
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body['login-email'];
  const password = req.body['login-password'];

  for (let userKey in users) {
    if ((users[userKey]['email'] === email) && (users[userKey]['password'] === password)) {
      res.cookie('user_id', userKey);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("Invalid login credentials.");
  return;
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
    return;
  } res.status(404).send("That email is already in use!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const addUserToTemplateVars = (template, req) => {
  for (let userKey in users) {
    if (userKey === req.cookies["user_id"]) {
      template.user = users[userKey];
    }
  } return template;
};

const urlsForUser = (id) => {
  //send an array of the shortUrls belonging to the signed in user
  const urls = [];

  if (id !== undefined) {
    for (let shorturl in urlDatabase) {
      if (urlDatabase[shorturl]['userID'] === id) {
        urls.push(shorturl);
      }
    }
  } return urls;
  
}