const express = require('express');
const Router = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const upload = require('../middleware/imgUpload');
const Schema = require('../models/Schema');
  
Router.post('/products', upload, auth, async (req, res) => {
    if(req.verified){
        try {
            const post = req.body
            Schema.create({ 
                ...post, 
                creator: req.userId, 
                createdAt: new Date().toISOString(),
            }).then(createdProduct => {
                res.json(createdProduct)
            })
        } catch(error){
            res.status(400).send({ 
                error: 'Error while uploading file try again later'
            });
        }
    } else {
        res.status(500).send({ 
            error: 'You have not verified your email'
        });  
    }
});

Router.put('/products/:id', auth, async (req, res) => {   
    if(req.verified){
        Schema.updateOne({_id: req.params.id}, req.body)
        .exec()
        .then(product => res.json(product))
        .catch(err => res.status(500).json(err))
    } else {
        res.status(500).send({ 
            error: 'You have not verified your email'
        });  
    }
});

Router.get('/photos/:id', async (req, res) => {
    try {
        const result = await Schema.findById(req.params.id);
        res.set('Content-Type', 'image/jpeg');
        res.send(result.photo)
    }
    catch(error){
        res.status(400).send({ get_error: 'Error while uploading try again later ...' })
    }
});

Router.get('/products', async (req, res) => {
    Schema.find()
        .exec()
        .then(products => res.json(products))
        .catch(err => res.status(500).json(err))
});

Router.delete('/products/:id', auth, async (req, res) => {
    if(req.verified){
        Schema.deleteOne({_id: req.params.id})
        .exec()
        .then(()=> {
            res.json({ success: true });
        })
        .catch(err => res.status(500).json(err))
    } else {
        res.status(500).send({ 
            error: 'You have not verified your email'
        });  
    }
});

module.exports = Router;
