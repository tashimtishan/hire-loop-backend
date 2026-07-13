const express = require('express');
const app = express()
const port = 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
app.use(express.json());
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})





const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const database = client.db("hireloop_db");
    const jobsCollection = database.collection("jobs");
    const companiesCollection = database.collection("companies");
    const applicationsCollection = database.collection("applications");
    app.post('/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobsCollection.insertOne(job);
      res.send({ success: true, ...result });
    })

    app.get("/jobs", async (req, res) => {
      const { recruiterId } = req.query;
      const filter = recruiterId ? { recruiterId } :
        {};
      const result = await jobsCollection.find(filter).toArray();
      res.send(result);
    })

    app.post('/companies', async (req, res) => {
      const company = req.body;
      company.status = "pending";
      company.createdAt = new Date();
      const result = await companiesCollection.insertOne(company);
      res.send({ success: true, ...result });
    })

    app.get("/companies", async (req, res) => {
      const { recruiterId } = req.query;
      const filter = recruiterId ? { recruiterId } : {};
      const result = await companiesCollection.find(filter).toArray();
      res.send(result);
    })
    app.put('/companies/:id', async (req, res) => {
      const { id } = req.params;
      const update = req.body;
      delete update._id;
      const result = await companiesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      );
      res.send({ success: true, ...result });
    })

    app.get('/jobs/:id', async (req, res) => {
      const { id } = req.params;
      const result = await jobsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    })
    app.post('/applications', async (req, res) => {
      const applications = req.body;
      const result = await applicationsCollection.insertOne(applications);
      res.send({ success: true, ...result });
    })

    app.get('/applications', async (req, res) => {
      const {seekerId, jobId} = req.query;
      const filter = {};
      if(seekerId) filter.seekerId = seekerId;
      if(jobId) filter.jobId = jobId;
      const result = await applicationsCollection.find(filter).toArray();
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})