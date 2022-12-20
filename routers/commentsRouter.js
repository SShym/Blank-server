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

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(Router)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

Router.post('/comments', upload, auth, async (req, res) => {
    if(req.verified){
        try {
            if(req.file){
                cloudinary.v2.uploader.upload(req.file.path, (err, result) => {  
                    if (err) req.json(err.message);  
            
                    Schema.create({ 
                        ...req.body, 
                        creator: req.userId, 
                        photo: result.secure_url,
                        photoId: result.public_id,
                        photoSize: {
                            width: req.body.photoSize.width,
                            height: req.body.photoSize.height
                        },
                        createdAt: new Date().toISOString(),
                    }).then(createdProduct => {
                        res.json(createdProduct);
                    })
                });
            } else {
                Schema.create({ 
                    ...req.body, 
                    creator: req.userId,
                    createdAt: new Date().toISOString(),
                }).then(createdProduct => res.json(createdProduct))
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
    const photo = await Schema.findById(req.params.id);
    if(req.verified){
        try {
            if(req.file){
                photo.photoId && cloudinary.v2.uploader.destroy(photo.photoId);

                cloudinary.v2.uploader.upload(req.file.path, (err, result) => {  
                    if (err) req.json(err.message);  
            
                    Schema.updateOne({_id: req.params.id}, {
                        ...req.body,
                        photo: result.secure_url,
                        photoId: result.public_id,
                    }).then(() => {
                        Schema.findById(req.params.id).then((result) => res.json(result))
                    }).catch(err => res.status(500).json(err))
                });
            } else {
                req.body.photo?.length === 0 && cloudinary.v2.uploader.destroy(photo.photoId);

                await Schema.updateOne({_id: req.params.id}, req.body).then(() => {
                    Schema.findById(req.params.id).then((result) => res.json(result))
                })
            }
        } catch(error){
            console.log(error)
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

Router.use(function(req,res,next) {
    req.io = io;
    next();
});

io.on('connect', (socket) => {
    let messages = {};
    
    const updateMessageList = () => io.emit('comments', messages);

    Router.get('/comments/:page', async (req, res) => {
        try {
            const LIMIT = 5;
            const startIndex = (Number(req.params.page) - 1) * LIMIT; // get the starting index of every page
        
            const total = await Schema.countDocuments({});
            const comments = await Schema.find().sort({ _id: 0 }).limit(LIMIT).skip(startIndex);
    
            messages = { 
                data: comments, 
                currentPage: Number(req.params.page), 
                numberOfPages: Math.ceil(total / LIMIT)
            }
            
            res.json({ 
                data: comments, 
                currentPage: Number(req.params.page), 
                numberOfPages: Math.ceil(total / LIMIT)
            });
    
            updateMessageList();
        } catch (error) {    
            res.status(500).json({ data: null, currentPage: 1, numberOfPages: 1, message: error.message });
        }  
    });

})

Router.delete('/comments/:id', auth, async (req, res) => {
    const photo = await Schema.findById(req.params.id);

    if(req.verified){
        Schema.deleteOne({_id: req.params.id})
        .exec().then(() => {
            photo.photoId && cloudinary.v2.uploader.destroy(photo.photoId)
            res.json({ success: true });
        })
        .catch(err => res.status(500).json(err))
    } else {
        res.status(500).send({ 
            error: 'You have not verified your email'
        });  
    }
});

server.listen(3001, () => {
    console.log("Websocket server is running!")
})

module.exports = Router;
