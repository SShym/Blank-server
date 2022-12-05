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

app.get("/", async (req, res) => { res.send('APP IS RUNNING')} );

app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()).use(bodyParser.json());

app.use(authRouter);
app.use(commentsRouter);

app.listen(PORT, () => console.log(`The Server is Running Successfully on PORT ${PORT}`));