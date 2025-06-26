import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import UserRouter from "./routers/user.route.js"
dotenv.config();
const app=express();
//git remote add origin https://github.com/Janvi521/backendAPI.git
mongoose.connect(process.env.DB_URL)
.then(result=>{
    console.log("Mongo URI:", process.env.MONGO_URI);

    app.use(cors())
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use("/user",UserRouter);
    app.listen(3000,()=>{
        console.log("server started");
    })
    
    
}).catch(err=>{
    console.log(err)
    console.log("Database connectection failed");
});

const db=mongoose.connection;

export default db;