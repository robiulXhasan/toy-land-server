const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yce8pf3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollections = client.db("toyLandDB").collection("toys");
    const reviewCollection = client.db("toyLandDB").collection("reviews");
    //all toys
    app.get("/toys", async (req, res) => {
      const cursor = toysCollections.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });
    //all reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //post toy data
    app.post("/toys", async (req, res) => {
      const toy = req.body;

      const result = await toysCollections.insertOne(toy);
      res.send(result);
    });
    // delete
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await toysCollections.deleteOne(cursor);
      res.send(result);
    });

    //update
    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: toy.price,
          quantity: toy.quantity,
          description: toy.description,
        },
      };
      const result = await toysCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    //toys by category
    app.get("/toys/category", async (req, res) => {
      if (req.query?.subcategory) {
        query = {
          sub_category: { $regex: `^${req.query.subcategory}$`, $options: "i" },
        };
      }
      const result = await toysCollections.find(query).toArray();
      res.send(result);
    });
    //specific toy by id
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.findOne(query);
      res.send(result);
    });
    //toy by name
    app.get("/toys/name/", async (req, res) => {
      let query = {};
      if (req.query?.name) {
        const regexPattern = new RegExp(req.query?.name, "i");
        query = {
          toy_name: regexPattern,
        };
      }
      const result = await toysCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/mytoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          seller_email: req.query?.email,
        };
      }
      const option = parseInt(req.query.sort);
      if (option == 0) {
        const result = await toysCollections.find(query).toArray();
        res.send(result);
      } else {
        const result = await toysCollections.find(query).sort({ price: option }).toArray();
        res.send(result);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToyLand server Running");
});

app.listen(port, () => console.log(`ToyLand Running on port : ${port}`));
