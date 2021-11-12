const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

// Connecting the DB
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ofdcm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("I am testing db");
});
async function run() {
  try {
    await client.connect();
    const database = client.db("destination_db");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    // GET API
    app.get("/properties", async (req, res) => {
      const cursor = serviceCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.json(result);
      console.log(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // POST API
    app.post("/orders", async (req, res) => {
      const user = req.body;
      const result = await orderCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: user };
      const options = { upsert: true };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      console.log(result);
      res.json(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    // Delete API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // Update pending api
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(filter, {
        $set: { status: 1 },
      });
      res.json(result);
    });
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { email: email };
      const result = await userCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("The server is running on port: ", port);
});
