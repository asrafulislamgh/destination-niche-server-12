const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
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

    // GET API
    app.get("/properties", async (req, res) => {
      const cursor = serviceCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // My order getting
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      console.log(cursor);
      // console.log(result);
      res.json(result);
    });

    // POST API
    app.post("/orders", async (req, res) => {
      const user = req.body;
      const result = await orderCollection.insertOne(user);
      console.log(result);
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
