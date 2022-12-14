const express = require('express');
const Router = express();
const auth = require('../middleware/auth');
const upload = require('../middleware/imgUpload');
const Schema = require('../models/Schema');
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dotmufoiy",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

Router.post('/comments', upload, auth, async (req, res) => {
    if(req.verified){
        try {
            if(req.file){
                cloudinary.v2.uploader.upload(req.file.path, (err, result) => {  
                    if (err) req.json(err.message);  
            
                    const post = req.body
                    Schema.create({ 
                        ...post, 
                        creator: req.userId, 
                        photo: result.secure_url,
                        photoId: result.public_id,
                        createdAt: new Date().toISOString(),
                    }).then(createdProduct => {
                        res.json(createdProduct)
                    })
                });
            } else {
                const post = req.body

                Schema.create({ 
                    ...post, 
                    creator: req.userId,
                    createdAt: new Date().toISOString(),
                }).then(createdProduct => {
                    res.json(createdProduct)
                })
            }
        } catch(error){
            res.status(400).send({ 
                error: 'Error while uploading file try again later'
            });
            console.log(error)
        }
    } else {
        res.status(500).send({ 
            error: 'You have not verified your email'
        });  
    }
});

Router.put('/comments/:id', upload, auth, async (req, res) => {  
    if(req.verified){
        try {
            if(req.file){
                cloudinary.v2.uploader.upload(req.file.path, (err, result) => {  
                    if (err) req.json(err.message);  
            
                    const post = req.body
                    Schema.updateOne({_id: req.params.id}, {
                        ...post,
                        photo: result.secure_url,
                        photoId: result.public_id,
                    }).exec().then(product => res.json(product))
                    .catch(err => res.status(500).json(err))
                });
            } else {
                Schema.updateOne({_id: req.params.id}, req.body)
                    .exec()
                    .then(product => res.json(product))
            }
        } catch(error){
            res.status(400).send({
                error: 'Error while uploading file try again later'
            });
            console.log(error); 
        }
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

Router.get('/comments/:page', async (req, res) => {
    const page = req.params.page;
    try {
        const LIMIT = 5;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await Schema.countDocuments({});
        const comments = await Schema.find().sort({ _id: 0 }).limit(LIMIT).skip(startIndex);

        res.json({ data: comments, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(500).json({ data: null, currentPage: 1, numberOfPages: 1, message: error.message });
    }
});

Router.delete('/comments/:id', auth, async (req, res) => {
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
