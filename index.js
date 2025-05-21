require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI);
let db;

app.use(express.json());

app.post('/sync-grants', async (req, res) => {
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    try {
      const docs = req.body;
      const collection = db.collection('grants-testing');
  
      for (const doc of docs) {
        if (!doc.grant_id) continue;
        await collection.updateOne(
          { grant_id: doc.grant_id },
          { $set: doc },
          { upsert: true }
        );
      }
  
      res.status(200).json({ status: 'ok', count: docs.length });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
app.listen(PORT, async () => {
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME || 'grantsDB');
  console.log(`Server listening on ${PORT}`);
});
