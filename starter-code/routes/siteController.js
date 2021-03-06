const express = require("express");
const siteController = express.Router();
// User model
const User           = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const ensureLogin = require("connect-ensure-login");
const passport      = require("passport");
const checkBoss = checkRoles('Boss');


siteController.get("/", (req, res, next) => {
  res.render("index");
});

siteController.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});
//express middleware that will check if we are authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}


//add new route with path signup and pointing to the view
siteController.get("/signup", (req, res, next) => {
  res.render("passport/signup");
});

//Post route to receive the data from the signup form and save the user
siteController.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  console.log(req.body);
  if (username === "" || password === "") {
    res.render("passport/signup", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "username": username }, "username", (err, user) => {
    if (user !== null) {
      res.render("passport/signup", {
        errorMessage: "The username already exists"
      });
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      username,
      password: hashPass,
      role
    });

    newUser.save((err) => {
      if (err) {
        res.render("passport/signup", {
          errorMessage: "Something went wrong when signing up"
        });
      } else {
         res.redirect("/login");
      }
    });
  });
});

//Post route to receive the data from the Boss Private form and save new Employee
siteController.post("/private-page", (req, res, next) => {
  const username = req.body.username;
  const name = req.body.name;
  const familyName = req.body.familyName;
  const password = req.body.password;
  const role = req.body.role;

  if (username === "" || password === "") {
    res.render("passport/signup", {
      errorMessage: "Indicate a username and a password to add a new Employee"
    });
    return;
  }

  User.findOne({ "username": username }, "username", (err, user) => {
    if (user !== null) {
      res.render("passport/signup", {
        errorMessage: "The username already exists"
      });
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      username,
      name,
      familyName,
      password: hashPass,
      role
    });

    newUser.save((err) => {
      if (err) {
        res.render("passport/signup", {
          errorMessage: "Something went wrong when signing up"
        });
      } else {
         res.redirect("/");
      }
    });
  });
});

//LOGIN
siteController.get("/login", (req, res, next) => {
  res.render("passport/login");
});

siteController.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
//  failureFlash: true,
  passReqToCallback: true
}));

//Private sections for roles
function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login');
    }
  };
}




siteController.get("/boss", ensureLogin.ensureLoggedIn(), (req, res) => {
  if (req.user.role == "Boss") res.render("passport/boss", { user: req.user });
});

siteController.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = siteController;
