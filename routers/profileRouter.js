const express = require('express');
const Router = express();
const Schema = require('../models/Schema');

Router.post('/profile', async (req, res) => {
    try {
        const user = await Schema.findById(req.body.id);
        res.json({ 
            userName: user.name, 
            userAvatar: user.avatar, 
        });
    } catch(error){
        res.status(400).send({ message: 'error' });
    }
});


module.exports = Router;
