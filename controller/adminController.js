const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const Users=require("../models/UsersSchema")
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
                token:token
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
        const allUser=await Users.find()

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
            return res.status(404).json({
                status:"error",
                message:"users not found"
            });
        }

        res.status(200).send({
            status:"success",
            message:"successfully find user",
            data:user,

        });

     },

     // to create product


     createProduct:async(req,res)=>{
        const {value,error}=joiProductSchema.validate(req.body);
        const {title,description,price,image,category}=value;
        console.log(value);
        if(error){
            return res.status(400).json({error:error.details[0].message});

        }else{
            await products.create({
                title,
                description,
                price,
                image,
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

     allProduct:async(req,res)=>{
        const prods = await products.find()
        
        if(!prods){
            return(
                res.status(404),
                send({
                    status:"error",
                    message:"products not found"
                })
            )
        }
        res.status(200).json({
            status:"success",
            message:"successfully fetched the products details ",
            data:prods,
        })
     },

     productById:async(req,res)=>{
        const productId=req.params.id;
        const product=await products.findById(productId)
        if(!product){
            return res.status(404).json({
                status:"error",
                message:"product not found"
            });
        }
        res.status(200).json({
            status:"success",
            message:"successfully fetched the products details",
            data:product
        });
     },

     deleteProduct:async(req,res)=>{
        const {productId}=req.body
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                status:"failure",
                message:"invalid product id provided"
            });
        }

        const deletedProduct = await products.findOneAndDelete({_id:productId});


        if(!deletedProduct){
            return res.status(404).json({
                status:"failure",
                message:"product not found in the database"
            });
        }
        return res.status(200).json({
            status:"success",
            message:"deleted successfully"
        });


     },

     //update product

     updateProduct:async(req,res)=>{
        try{
            const {value,error} = joiProductSchema.validate(req.body);
            const {id,title,description,price,image,category} = value;
            if(error){
                return res.status(401).json({status:"error",message:error.details[0].message});
            }
            const updatedProduct = await products.findByIdAndUpdate(
                id,
                {$set:{title,description,price,image,category}},
                {new:true}//this option returns the modified document rather than the orginal
            );
            console.log(updatedProduct)
            

          if (updatedProduct) {
            const updatedProduct = await products.findById(id);
            return res.status(200).json({
                status:"success",
                message:"successfully updated the product",
                data:updatedProduct,
            })

          }else{
            return res.status(404).json({status:"error", message:"product not found"})
          }
        }catch(error){
            console.error("error updating product",error);
            return res.status(500).json({status:"error",message:"internal server Error"});
        }
    },

}



