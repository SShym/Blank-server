const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('./DB/db'); 
const app = express();
const authRouter = require('./routers/authRouter');
const commentsRouter = require('./routers/commentsRouter');
const profileRouter = require('./routers/profileRouter');
const { Server } = require('socket.io');
const Schema = require('./models/Schema');
const userSchema = require('./models/userSchema');

const PORT = process.env.PORT;

app.use(cors());

Database();

app.get("/", async (req, res) => { res.send('APP IS RUNNING!')} );

app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()).use(bodyParser.json());

const server = app.listen(PORT, () =>
  console.log(`Server started on ${PORT}`)
);

const io = new Server(server, {
    cors: { origin: `${process.env.siteURL}` },
});

io.on('connect', (socket) => {
    let messages = {};
    let profile = {};
    let currentPage = null
    
    const updateMessageList = () => io.emit('comments', messages);

    const updateProfile = () => io.emit('profile', profile);

    socket.on('comment:get', async (page) => {
        const LIMIT = 5;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await Schema.countDocuments({});
        const comments = await Schema.find()
        // .sort({ _id: 0 }).limit(LIMIT).skip(startIndex);

        messages = { 
            data: comments, 
            // currentPage: Number(page), 
            // numberOfPages: Math.ceil(total / LIMIT)
        }

        updateMessageList();
    })

    socket.on('profile:get', async (id) => {
        profile = await userSchema.findById(id);
        
        updateProfile();
    })
})

app.use(authRouter);
app.use(commentsRouter);
app.use(profileRouter);