const express = require('express');
const mongoose = require('mongoose');
const Router = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/userSchema');
const tokenSchema = require('../models/tokenSchema');
const crypto = require('crypto');

require('dotenv').config();
const nodemailer = require('nodemailer');

Router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const oldUser = await userSchema.findOne({ email });

      if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });
      
      const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
      
      if (!isPasswordCorrect && !(password == oldUser.password)){
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, 'test', {});
      
      res.status(200).json({ result: oldUser, token });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.log(error)
    }
});

const verification = async (email, link, firstName) => {
  const transporter =  nodemailer.createTransport({
    service: 'gmail',
    // secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
  })

  const mailConfigurations = {
      subject: "Verification",
      from: 'request1323@gmail.com',
      to: email,
      html: `<div>Hello, <strong>${firstName}</strong>!<br>
      Follow the link <a href=${link}>click</a> to confirm your email.<br>
      Link is valid for 30 minutes after the expiration date it will be invalid.</div>`,
  }
  transporter.sendMail(mailConfigurations, error => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent Successfully');
    };
  });
};

Router.post('/resend-verification',  async (req, res) => {
  try {
    const { email } = req.body
    const user = await userSchema.findOne({email});
  
    if (!user.verified) {
			let token = await tokenSchema.findOne({ userId: req.body._id });
			if (!token) {

				const token = await new tokenSchema({
          userId: req.body._id,
					token: jwt.sign({}, 'token')
				}).save();
				const link = `http://localhost:3000/${req.body._id}/verify/${token.token}`;
        await verification(req.body.email, link, req.body.name);

			}
			return res.status(201).send({ message: "An Email sent to your account please verify" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
    console.log(error)
	}
})

Router.post('/register',  async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
  
    try {
      const oldUser = await userSchema.findOne({ email });
  
      if (oldUser){
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await userSchema.create({ 
        email, 
        password: hashedPassword, 
        name: `${firstName} ${lastName}` 
      });

      const tokenS = await new tokenSchema({
        userId: result._id,
        token: jwt.sign({}, 'token'),
      }).save();
      
      const link = `http://localhost:3000/${tokenS.userId}/verify/${tokenS.token}`;

      await verification(email, link, firstName);

      res.status(201).json({ notification: 'Email sent Successfully' })
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.log(error);
    }
});

Router.get("/:id/verify/:token", async (req, res) => {
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

Router.post('/delete/:id', async (req, res) => {
  try{
    const token = await tokenSchema.findOne({userId: req.body.id});
		if (!token){
      await userSchema.findOneAndDelete(req.body.id);
      res.status(200).json({ message: 'Profile has been successfully deleted' })
    } else {
      await token.remove();
      await userSchema.findOneAndDelete(req.body.id);
      res.status(200).json({ message: 'Profile has been successfully deleted' })
    }
  } catch(err){
    res.status(200).json({ message: 'The profile has not been deleted' })
  }
})

module.exports = Router;
