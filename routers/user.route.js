import express from "express";
import {body} from "express-validator";
import { createUser,authenticateUser,varifyAccount } from "../controllers/user.controller.js";
const router=express();

router.post("/",body("name","name is required").notEmpty(),
  body("name","Only Alphabets are allowed").isAlpha(),
  body("email","invalide email id").isEmail(),
  body("password", "password is required").notEmpty(),
  body("contact", "contact number is required").notEmpty(),
  body("contact", "only digits are allowed").isNumeric(),createUser);
router.post("/authenticate",authenticateUser);
router.post("/verification",varifyAccount);
export default router;