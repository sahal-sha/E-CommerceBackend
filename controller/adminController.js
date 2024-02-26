const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const Users=require("../models/UsersSchema");
const UsersSchema = require("../models/UsersSchema");
const {joiProductSchema}=require("../models/validationSchema")
const products=require("../models/ProductSchema")

module.exports= {
    login:async(req,res)=>{
        const {email,password}=req.body;
        if(
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        )
        {
            const token=jwt.sign(
                {email:email},
                process.env.ADMIN_ACCESS_TOKEN_SECRET
            );

            return res.status(200).send({
                status:"success",
                message:"Admin registration successful",
                data:token
            })
        }else{
            return res.status(404).json({
                status:"error",
                message:"this is not an admin"
            })
        } 
    }, 
     //to find all user

     allUser:async(req,res)=>{
        const allUser=await UsersSchema.find()

        if(allUser.length===0){
            return res.status.json({
                status:"error",
                message:"user not found"
            })
        }
        res.status(200).json({
            status:"successfully",
            message:"successfully fetched user data",
            data:allUser,
        })


     },

     //specific user


     useById:async(req,res)=>{
        const userId=req.params.id;
        const user=await Users.findById(userId);


        if(!user){
            return status(404).json({
                status:"error",
                message:"users not found"
            })
        }

        res.status(202).send({
            status:"success",
            message:"successfully find user",
            data:user,

        });

     },

     // to create product


     createProduct:async(req,res)=>{
        const {value,error}=joiProductSchema.validate(req.body);
        const {title,description,price,Image,category}=value;
        console.log(value);
        if(error){
            return res.status(400).json({error:error.details[0].message});

        }else{
            await products.create({
                title,
                description,
                price,
                Image,
                category,



            });

            res.status(201).json({
                status:"success",
                message:"Successfully created products",
                data:products, 
            });
        
        }
     },

     //view all products with category





     
}



