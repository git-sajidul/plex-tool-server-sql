const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
// const verify = require("jsonwebtoken/verify");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  //   password: "secret",
  database: "PLEX_TOOL",
});

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,authorization"
  );
  next();
});

db.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + db.threadId);
});

app.get("/tools", async (req, res) => {
  const sql = "SELECT * from alltools";
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get all user
app.get("/alluser", (req, res) => {
  const sql = "SELECT * FROM allusers";
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get user by email
app.get("/user", async (req, res) => {
  const email = req.query.email;
  const sql = "SELECT * FROM allusers WHERE email='" + email + "'";
  // console.log(email);
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// Update user
app.put("/updateduser", (req, res) => {
  const user = req.body;
  const email = req.query.email;
  const emailquery = "SELECT * FROM allusers WHERE email='" + email + "'";
  const query = db.query(emailquery, (err, result) => {
    if (err) {
      throw err;
    } else {
      const sql = String(
        `UPDATE allusers SET name = "${user.name}", img = "${user.img}", phone = "${user.phone}", address = "${user.address}", social = "${user.linkedin}" WHERE id = ${result[0].id}`
      );
      const update = db.query(sql, (err, result) => {
        if (err) {
          throw err;
        } else {
          res.send(result);
        }
      });
    }
  });
});

// post user after regiser
app.post("/user", (req, res) => {
  const user = req.body;
  const sql = "INSERT INTO allusers SET ?";
  const query = db.query(sql, user, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// add product
app.post("/addproduct", (req, res) => {
  const tool = req.body;
  const sql = "INSERT INTO alltools SET ?";
  const query = db.query(sql, tool, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// Delete Product
app.delete("/deletetool/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM alltools WHERE id=${id}`;
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get product by id
app.get("/tool/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM alltools WHERE id=${id}`;
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// post orders
app.post("/create-order", (req, res) => {
  const order = req.body;
  const sql = "INSERT INTO orders SET ?";
  const query = db.query(sql, order, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get orders by email
app.get("/myorder", (req, res) => {
  const email = req.query.email;
  const sql = "SELECT * FROM orders WHERE email='" + email + "'";
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get order by id
app.get("/order/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM orders WHERE id=${id}`;
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// payment api
app.post("/create-payment-intent", async (req, res) => {
  const tool = req.body;
  // console.log(tool);
  const price = tool.price;
  const amount = price * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

// update order after payment
app.put("/order/:id", (req, res) => {
  const id = req.params.id;
  const payment = req.body;
  const sql = `SELECT * FROM orders WHERE id=${id}`;
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      const updateSql = `UPDATE orders set paid=1, transactionId="${payment.transactionId}" WHERE id = ${result[0].id}`;
      const query = db.query(updateSql, (err, result) => {
        if (err) {
          throw err;
        } else {
          res.send(result);
        }
      });
    }
  });
});

// Delete order
app.delete("/delete-order", (req, res) => {
  const id = req.query.id;
  const sql = `DELETE FROM orders WHERE id=${id}`;
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

//Get all orders
app.get("/allorders", (req, res) => {
  console.log("Hitted");
  const sql = "SELECT * FROM orders";
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// Manage all products

// Post review
app.post("/addreview", (req, res) => {
  const review = req.body;
  const sql = "INSERT INTO reviews SET ?";
  const query = db.query(sql, review, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

// get review
app.get("/reviews", (req, res) => {
  const sql = "SELECT * FROM reviews";
  const query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    } else {
      res.send(result);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello from Plex Tools");
});
app.listen(port, () => {
  console.log("Plex app running on", port);
});
