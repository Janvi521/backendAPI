
import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
import { response } from "express";

dotenv.config();

export const createUser = async (request,response,next)=>{
     try{
        const errors=validationResult(request);
        if(!errors.isEmpty())
            return response.status(400).json({errors:"Bad request",errorMessages:errors.array()})
        let { password,name,contact,email}=request.body;
        const saltKey=bcrypt.genSaltSync(12);
        password=bcrypt.hashSync(password,saltKey);
        let result = await User.create({name,password,email,contact});
        await sendEmail(email,name);
        return response.status(201).json({message:"User Created",user:result});

     }
    catch(err){
         console.error(err);
        return response.status(500).json({err:"Internal Server Error"});
    }
}

export const varifyAccount= async (request,response,next)=>{
    try{
        let {email}=request.body;
        let result =await User.updateOne({email},{$set:{isVerified:true}});
        return response.status(200).json({message:"Account Verified Successfully"})
    }
    catch(err){
         console.error(err);
        return response.status(500).json({err:"Internal Server Error"})
    }
}

export const authenticateUser = async (request,response,next)=>{
    try{
        let {email,password}=request.body;
        let user= await User.findOne({email});
        if(!user.isVerified)
            return response.status(400).json({error:"Unauthorized user | Account is not verified"})

        if(!user)
            return response.status(400).json({error:"Unauthorized user | Gmail not found"});

         let status = await bcrypt.compare(password, user.password);

         user.password=undefined;

         status&& response.cookie("token",generateToken(user.email,user._id,user.contact));

         return status ? response.status(200).json({message:"Sign In success",user}): response.status(401).json({ error: "Unauthorized user | Invalid password"});
    }
    catch(err){
         console.error(err);
        return response.status(500).json({error:"Internal Servaer error"})
    }
}



const sendEmail=(email,name)=>{
    return new Promise((resolve,reject)=>{
        let transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'mediconnect59@gmail.com',
                pass:'aqlf odnu pgtb gqhs'
            }
        });
            let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Account Verification',
            html: `<h4>Dear ${name}</h4>
            <p>Thank you for registration. To verify account please click on below button</p>
            <form method="post" action="http://localhost:3000/user/verification">
              <input type="hidden" name="email" value="${email}"/>
              <button type="submit" style="background-color: blue; color:white; width:200px; border: none; border: 1px solid grey; border-radius:10px;">Verify</button>
            </form>
            <p>
               <h6>Thank you</h6>
               Backend Api Team.
            </p>
            `
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
              resolve();
            }
        });
    })
}

const generateToken = (email,userId,contact)=>{
    let payload = {email,userId,contact};
    return jwt.sign(payload,process.env.TOKEN_SECRET);
}