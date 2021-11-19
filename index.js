
const express = require('express')
const app = express()
const cors = require('cors');
const admin = require("firebase-admin");
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;




const serviceAccount = require('./bicycle-store-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbnum.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
    try{
      await client.connect();
      const database = client.db('bicycle-store');
      const allProductsCollection = database.collection('allProducts');
      const productsCollection = database.collection('products');
      const userCollection = database.collection('users');

      app. get('/allProducts', async(req, res) => {
        const cursor = allProductsCollection.find({});
        const allProducts = await cursor.toArray();
        res.send(allProducts)
      })

      app.post('/allProducts', async(req, res) => {
        const allProduct = req.body;
          console.log('hit the post api', allProduct);
        
        const result = await allProductsCollection.insertOne(allProduct);
        console.log(result);
        res.json(result)
      })
      
       // Delete API
       app.delete('/allProducts/:id', async(req, res) => {
        const id = req.params.id;
        const query ={_id:ObjectId(id)};
        const result = await allProductsCollection.deleteOne(query);
        res.json(result);
      })
      
      app.get('/products', async (req, res) =>{
        const email = req.query.email;
        const query = {email: email}
      
        
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
       
        res.json(products);
      })

      app.post('/products', async (req, res) =>{
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        
        res.json(result)
        
      });

      app.get('/users/:email', async(req, res) =>{
        const email = req.params.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin'){
          isAdmin= true;
        }
        res.json({admin: isAdmin});
      })

      app.post('/users', async(req, res) => {
          const user = req.body;
          const result = await userCollection.insertOne(user);
          console.log(result);
          res.json(result)
      });

      app.put('/users/admin', async(req, res) =>{
        const user = req.body;
        console.log('put', user);
        const filter = { email: user.email};
        const updateDoc = {$set: { role: 'admin'} };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result);
      })
     
    }
    finally{
      // await client.close()
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Bicycle Store!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})