const bcrypt=require("bcrypt");
const User=require("../models/UsersSchema");
const { joiUserSchema } = require("../models/validationSchema");
const jwt=require("jsonwebtoken")
const products=require("../models/ProductSchema");
const {default: mongoose } = require("mongoose");



let sValue=[];


module.exports={
    userRegister:async(req,res)=>{
        const {value,error}=joiUserSchema.validate(req.body);
        const {name,email,username,password}=value;
        const hashedPassword=await bcrypt.hash(password,10)
        if(error){
            res.status(400).json({
                status:'Error',
                message:'Invalid user input .please check data'
            });
        }
        const userData = await User.create({
            name:name,
            email:email,
            username:username,
            password:hashedPassword,
        });

        res.status(201).json({
            status:"status",
            message:"User registration Successfull",
            data: userData
        })
    },


    userLogin:async(req,res)=>{
        const {value,error}=joiUserSchema.validate(req.body);

        if(error){
            res.json(error.message);
        }
        const {username,password}=value;
        const user=await User.findOne({
            username:username,
        });
        if(!user){
            return res.status(404).json({
                status:"error",
                messsage:"User not found"
            });
        }

        if(!password || !user.password){
            return res
            .status(400)
            .json({status:"error",message:"Invalid input" });
        }

        const passwordMatch=await bcrypt.compare(password,user.password);
        if(!passwordMatch){
            return res.status(401).json({error:"error",message:"incorrect password"});
        }

        const token=jwt.sign(
            {username:user.username},
            process.env.USER_ACCESS_TOKEN_SECRET,
            {
                expiresIn:86400,
            }

        );
        res
        .status(200)
        .json({status:"success",message:"Login Successfull",Token:token})
    },

     //user view all products

     viewProduct: async(req,res)=>{
        const Product=await products.find();
        if(!Product){
            res.status(404).send({status:"error",message:"product not found"})

        }
        res.status(200).send({
            status:"success",
            message:"successfully fetched data",
            data:Product
        });
     },

     //specific products


     productById:async(req,res)=>{
        const productId=req.params.id;
        const prod=await products.findById(productId);
        if(!prod){
            return res.status(404).json({
                status:"error",
                message:"product not found"
            });
        }

        res.status(200).json({
            status:"success",
            data:prod
        })

     },

     //add to cart

     addToCart:async(req,res)=>{
        const userId=req.params.id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).send({
                status:"failed",
                message:"user not found",
            });
        }

        const {productId}=req.body;

        if(!productId){
            return res.status(404).send({
                status:"failed",
                message:"product not found"
            });
        }

        await User.updateOne({_id:userId},{$addToSet:{cart:productId}});
        res.status(200).send({
            status:"success",
            message:"successfully product was added to cart"
        });
     },
     //cart view

     viewCartProduct:async(req,res)=>{
        const userId=req.params.id;
        const user = await User.findById(userId);

        if(!user){
            return res
            .status(404).json({
                status:"failed",
                message:"user not found"
            })
        }
        const cartProductId=user.cart;

        if(cartProductId.length === 0){
            return res.status(200).json({
                status:"success",
                message:"cart is empty",
                data:[]
            })
        }

        const cartProducts=await products.find({_id:{$in:cartProductsId}});
        res.status(200).json({
            status:"success",
            message:"Cart products fetched successfully",
            data:cartProducts,
        });


     },

     

}


