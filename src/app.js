const path = require("path");
const express = require("express");
const hbs = require("hbs");
const geocode = require("./utils/geocode");
const forecast = require("./utils/forecast");

const app = express();
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
  res.render("index", {
    title: "Winter is Coming.",
    name: "Sumit Tiwari",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Me",
    name: "Sumit ",
    aboutText:
      "I am a passionate web developer with years of experience in creating robust and user-friendly web applications. My expertise includes front-end and back-end development, and I am proficient in various programming languages and frameworks such as HTML, CSS, JavaScript, Node.js, and React. I strive to deliver high-quality solutions that meet the needs of clients and users. In my free time, I enjoy exploring new technologies, contributing to open-source projects, and expanding my skill set.",
  });
});

app.get("/help", (req, res) => {
  res.render("help", {
    helpText:
      "Welcome to the help page! If you need assistance, you're in the right place. Here you can find useful information and guidance on how to use our application effectively.",
    title: "Help",
    name: "Ansari Mantasha",
  });
});

app.get("/weather", (req, res) => {
  if (!req.query.address) {
    return res.send({
      error: "You must provide an address!",
    });
  }

  geocode(
    req.query.address,
    (error, { latitude, longitude, location } = {}) => {
      if (error) {
        return res.send({ error });
      }

      forecast(latitude, longitude, (error, forecastData) => {
        if (error) {
          return res.send({ error });
        }

        res.send({
          forecast: forecastData,
          location,
          address: req.query.address,
        });
      });
    }
  );
});

app.get("/products", (req, res) => {
  if (!req.query.search) {
    return res.send({
      error: "You must provide a search term",
    });
  }

  console.log(req.query.search);
  res.send({
    products: [],
  });
});

app.get("/help/*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Ansari Mantasha",
    errorMessage: "Help article not found.",
  });
});

app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Ansari Mantasha",
    errorMessage: "Page not found.",
  });
});

app.get("/404", (req, res) => {
  res.status(404).render("404", {
    title: "404",
    name: "Ansari Mantasha",
    errorMessage: "Page not found.",
  });
});

app.listen(port, "0.0.0.0",() => {
  console.log("Server is up on port " + port);
});
