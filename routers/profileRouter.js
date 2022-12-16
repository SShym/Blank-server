const express = require('express');
const Router = express();
const userSchema = require('../models/userSchema');

Router.post('/profile', async (req, res) => {
    try {
        const containOnlyNumber = /^\d+$/.test(req.body.id);

        const user = await userSchema.find(
            containOnlyNumber ? { googleId: req.body.id }: { _id: req.body.id }
        );
        
        res.status(200).json({ userName: user[0].name, userAvatar: user[0].avatar });
    } catch(error){
        console.log(error)
        res.status(400).send({ message: 'error' });
    }
});


module.exports = Router;
