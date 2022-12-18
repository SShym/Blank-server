const express = require('express');
const Router = express();
const Schema = require('../models/Schema');
const userSchema = require('../models/userSchema');
const upload = require('../middleware/imgUpload');
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dotmufoiy",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

Router.put('/change-settings', upload, async (req, res) => {
    console.log(req.body)
    const { id, firstName, lastName, token } = req.body

    const user = await userSchema.findById(id);

    try {
        if(req.file){
            user.avatarId && cloudinary.v2.uploader.destroy(user.avatarId);

            cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
                userSchema.updateOne({ _id: id }, { 
                    name: `${firstName} ${lastName}`,
                    avatar: result.secure_url,
                    avatarId: result.public_id
                }).then(() => {
                    Schema.find({ creator: id}).then(product => {
                        new Promise((resolve) => {
                            for(let x in product){
                              resolve(
                                Schema.updateMany({ creator: product[x].creator }, {
                                  avatar: result.secure_url,
                                  name: `${firstName} ${lastName}`,
                                })
                              );
                            }
                        });
                    });
                })
                .then(() => {
                    userSchema.findOne({ _id: id }).then((result) => {
                        res.json({
                            user: result, 
                            token: token
                        })
                    });
                })

            })
        } else if(req.body.photo?.length > 0) {
            userSchema.updateOne({ _id: id }, { 
                name: `${firstName} ${lastName}`,
            }).then(() => {
                Schema.find({ creator: id}).then(product => {
                    new Promise((resolve) => {
                        for(let x in product){
                          resolve(
                            Schema.updateMany({ creator: product[x].creator }, {
                              name: `${firstName} ${lastName}`,
                            })
                          );
                        }
                    });
                });
            }).then(() => {
                userSchema.findOne({ _id: id }).then((result) => {
                    res.json({
                        user: result, 
                        token: token
                    })
                });
            })
        } else {
            user.avatarId && cloudinary.v2.uploader.destroy(user.avatarId);

            userSchema.updateOne({ _id: id }, { 
                name: `${firstName} ${lastName}`,
                avatar: null,
                avatarId: null
            }).then(() => {
                Schema.find({ creator: id}).then(product => {
                    new Promise((resolve) => {
                        for(let x in product){
                          resolve(
                            Schema.updateMany({ creator: product[x].creator }, {
                              avatar: null,
                              name: `${firstName} ${lastName}`,
                            })
                          );
                        }
                    });
                });
            }).then(() => {
                userSchema.findOne({ _id: id }).then((result) => {
                    res.json({
                        user: result, 
                        token: token
                    })
                });
            })
        }
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Something went wrong" });
    }
});

// Router.put('/change-settings', upload, async (req, res) => {
//     const { id, firstName, lastName, token } = req.body
//     const product = await Schema.find({ creator: id});
//     const user = await userSchema.findOne({ _id: id });

//     try {
//         if(req.file){
//             cloudinary.v2.uploader.upload(req.file.path, (err, result) => {  
//                 if (err) req.json(err.message);  
        
//                 userSchema.updateMany({_id: id}, {
//                     ...req.body,
//                     name: `${firstName} ${lastName}`,
//                     avatar: result.secure_url,
//                     avatarId: result.public_id,
//                 }).then(() => {
//                     for(let x in product){
//                         Schema.updateMany({ creator: product[x].creator }, {
//                             avatar: result.public_id,
//                             name: `${firstName} ${lastName}`,
//                         })
//                     }
//                 }).then(() => {
//                     res.status(201).json({ message: 'Settings changed successfully', user, token });
//                 })
//             });
//         }
//         console.log(user)
//     } catch (error) {
//       console.log(error)
//       res.status(500).json({ message: "Something went wrong" });
//     }
// });

module.exports = Router;
