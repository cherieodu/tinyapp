const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  while (string.length < 6) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }

  return string;
}

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

  //here
  let templateVars = {
    username: '',
    urls: urlDatabase
  };
  templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  //here
  let templateVars = {
    username: '',
    urls: urlDatabase
  };
  templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  //here
  let shortURL = (req.params.shortURL).substring(1);
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], username: '' };
  templateVars = assignCookieUsername(templateVars, req);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  if(shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  const longURL = urlDatabase[shortUrl];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.redirect(`/urls/:${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  if(shortUrl[0] === ':') {
    shortUrl = shortUrl.substring(1);
  }
  urlDatabase[shortUrl] = req.body["longURL"];
  res.redirect('/urls');
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const assignCookieUsername = (template, req) => {
  if (req.cookies["username"]) {
    template.username = req.cookies["username"];
  }

  return template;
}