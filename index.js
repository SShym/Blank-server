const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('./DB/db'); 
const app = express();
const Schema = require('./models/Schema');
const authRouter = require('./routers/authRouter');
const commentsRouter = require('./routers/commentsRouter');
const userSchema = require('./models/userSchema');
const tokenSchema = require('./models/tokenSchema');

const PORT = process.env.PORT;

app.use(cors());

Database();

app.get('/', (req, res) => { res.send('APP IS RUNNING') });

app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()).use(bodyParser.json());

app.get("/:id/verify/:token", async (req, res) => {
    console.log('verification');
    try {
          const user = await userSchema.findOne({ _id: req.params.id });
  
      if (!user) return res.status(400).send({ message: "Invalid user" });
      
          const token = await tokenSchema.findOne({
              userId: req.params.id,
              token: req.params.token,
          });
  
          if (!token) return res.status(400).send({ message: "Invalid token" });
      
          await userSchema.updateOne({ _id: req.params.id}, { verified: true });
  
          await token.remove();
  
          res.status(201).json({ user });
      } catch (error) {
      console.log(error)
          res.status(500).send({ message: "Internal Server Error" });
      }
  });

app.use(authRouter);
app.use(commentsRouter)

app.listen(PORT, () => console.log(`The Server is Running Successfully on PORT ${PORT}`));