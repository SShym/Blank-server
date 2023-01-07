const { Server } = require('socket.io');
const cors = require("cors");
const express = require('express');
const app = express();
const Database = require('./DB/db'); 
const router = require('./routers/router');

const PORT = process.env.PORT;

app.use(cors());

Database();

app.get("/", async (req, res) => { res.send('SERVER IS RUNNING!') });

const server = app.listen(PORT, () => console.log(`Server started on ${PORT}`));

const io = new Server(server, {
    cors: { origin: `${process.env.siteURL}` },
});

require('./socket')(io)

app.use(router);