//Requires /Sets /Uses

const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


//Databases
const urlDatabase = {};

const users = {};

const visitCountTracker = {};

const uniqueVisitTracker = {};


//Gets
app.get("/", (req, res) => {
  res.redirect('/urls')
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

  if (req.session.user_id) {
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
  const shortURL = (req.params.shortURL).substring(1);
  const longURL = urlDatabase[shortURL]['longURL'];
  let templateVars = { shortURL, longURL};
  

  templateVars = addUserToTemplateVars(templateVars, req);
  urlsArray = urlsForUser(req.session.user_id);
  templateVars.urls = urlsArray;

  visitCountTracker[shortURL] === undefined ? templateVars.visitCount = 0 : templateVars.visitCount = visitCountTracker[shortURL];
  uniqueVisitTracker[longURL] === undefined ? templateVars.uniqueVisitCount = 0 : templateVars.uniqueVisitCount = uniqueVisitTracker[longURL].length;
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  const longURL = urlDatabase[shortUrl]['longURL'];

  visitCountTracker[shortUrl] ? visitCountTracker[shortUrl] += 1 : visitCountTracker[shortUrl] = 1;  
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.get("/login", (req, res) => {
  res.render("login");
});


//Posts

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"];
  urlDatabase[shortURL] = {longURL, userID: req.session.user_id};

  if (uniqueVisitTracker[longURL]) {
    if (uniqueVisitTracker[longURL].includes(req.session.user_id) === false) {
      uniqueVisitTracker[longURL].push(req.session.user_id);
    }
  } else {
    uniqueVisitTracker[longURL] = [];
    uniqueVisitTracker[longURL].push(req.session.user_id);
  }
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  if (shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }

  const urls = urlsForUser(req.session.user_id);
  
  if (urls.includes(shortUrl) === true) {
    urlDatabase[shortUrl] = {longURL: req.body["longURL"], userID: req.session.user_id};
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urls = urlsForUser(req.session.user_id);
  const shorturl = req.params.shortURL;

  if (urls.includes(shorturl) === true) {
    delete urlDatabase[req.params.shortURL];
  }
  
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body['login-email'];
  const password = req.body['login-password'];

  let user = getUserByEmail(email, users);
  
  if ((user !== undefined) && (bcrypt.compareSync(password, user['password']) === true)) {
    req.session.user_id = user['id'];
    res.redirect('/urls');
    return;
  }
  res.status(403).send("Invalid login credentials.");
  return;
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  let user = getUserByEmail(email, users);

  //The signup form already has 'required' attributes for the email and password but this is just in case.
  if ((email && password !== '') && user === undefined) {
    const user = {
      id,
      email,
      password
    };
  
    let ID = user.id;
    users[ID] = user;
    req.session.user_id = ID;
    res.redirect('/urls');
    return;
  } res.status(404).send("That email is already in use!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Functions
const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  while (string.length < 6) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }

  return string;
};

const addUserToTemplateVars = (template, req) => {
  for (let userKey in users) {
    if (userKey === req.session.user_id) {
      template.user = users[userKey];
    }
  } return template;
};

const urlsForUser = (id) => {
  //send an array of the shortUrls belonging to the signed in user.
  const urls = [];

  if (id !== undefined) {
    for (let shorturl in urlDatabase) {
      if (urlDatabase[shorturl]['userID'] === id) {
        urls.push(shorturl);
      }
    }
  } return urls;
  
};
