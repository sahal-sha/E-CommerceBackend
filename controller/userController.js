const bcrypt=require("bcrypt");
const User=require("../models/UsersSchema");
const { joiUserSchema } = require("../models/validationSchema");
const jwt=require("jsonwebtoken")
const products=require("../models/ProductSchema");
const {default: mongoose } = require("mongoose");
const stripe=require("stripe")(process.env.stripe_secret);
const Order = require("../models/orderSchema");



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

     // delete cart

    removeCartProduct : async(req,res)=>{
        const userId = req.params.id
        const itemId = req.params.itemId
        
        if(!itemId){
            return res.status(404).json({message:"Product not found"})
        }
        const user = await User.findById(userId)
        
        if(!user){
            res.status(404).json({message:"user not found"})
        }
        const result = await User.updateOne(
            {_id: userId},
            {$pull:{cart:itemId}}
        );
        
        if(result.modifiedCount >0){
            console.log("item removed successfully");
            res.status(200).json({message:"Product removed successfully",data: result})
        }else{
            console.log("Item not found in the cart");
        }
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

        const cartProducts=await products.find({_id:{$in:cartProductId}});
        res.status(200).json({
            status:"success",
            message:"Cart products fetched successfully",
            data:cartProducts,
        });


     },


     //add to wishlist


     addwishlist:async(req,res)=>{
        const userId=req.params.id;

        if(!userId){
            return res.status(404).json({
                status:"failure",
                message:"User not found"  
            })
        }

        const {productId}=req.body;
        const user=await User.findById(userId);

        if(!user){
            return res.status(404).json({
                status:"failure",
                message:"no product found"
            })
        }

        const findProd = await User.findOne({_id:userId, wishlist: productId});

        if(findProd){
            return res.status(404).json({
                status:"failure",
                message:"Product already in wishlist"
            })
        }

        const updateResult = await User.updateOne({_id: userId}, {$push: {wishlist: productId}});


        //Check if the update was successful
         return res.status(201).json({
            status:"success",
            message:"Product successfully added to wishlist",
            data: updateResult
            
         })

    },

    //show wishlist

    showWishlist:async(req,res)=>{
        const userId=req.params.id;
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({
                status:"failed",
                message:"user not found"
            })
        }
        const wishProdId = user.wishlist;
        if(wishProdId.length===0){
            return res.status(200).json({
                status:"success",
                message:"user wishlist is empty",data:[]
            })
        }

        const wishProducts = await products.find({_id:{$in:wishProdId}})
            return res.status(200).json({
            status:"success",
            message:"Wishlist product fetched successfully",
            data:wishProducts
        })
    },
    // delete wishlist

    delete:async(req,res)=>{
        const userId = req.params.id;
        const {productId} = req.body;
        if(!productId){
            return res.status(400).json({
                status:"failed",
                message:"product not found"
            })
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                status:"failed",
                message:"user not found"
            })
        }
        await User.updateOne({_id:userId},{$pull:{wishlist:productId}});
         return res.status(200).json({
            status:"success",
            message:"successfully removed from wishlist"
         })
    }, 


    //payment 

    payment:async(req,res)=>{
        const userId = req.params.id;
        const user = await User.findOne({_id: userId}).populate("cart");

        // console.log(user,'hello');

        if(!user){
            return res.status(404).json({
                status:"failed",
                messsage:"User not found"
            });
        }

        const cartProducts = user.cart

        if(cartProducts.length===0){
            return res.status(200).json({
                status:"success",
                message:"Cart is empty",
                data:[]
            })
        }
        const lineItems = cartProducts.map((item)=>{
            return{
                price_data:{
                    currency:"inr",
                    product_data:{
                        name:item.title,
                        description:item.description
                    },
                    unit_amount:Math.round(item.price*100),
                },
                quantity:1,
            }
           
        });
        
        session = await stripe.checkout.sessions.create({
            payment_method_types : ["card"],
            line_items: lineItems,
            mode:"payment",
            success_url:"http://localhost:3001/api/user/payment",
        })

        if(!session){
            return res.json({
                status:"failure",
                message:"Error occured on session side",
            });
        }
        // sValue.push(
        //     userId,
        //     user,
        //     session,
        // )

        sValue = {
            userId,
            user,
            session
        }
        res.status(200).json({
            status:"Success",
            message:"Strip payment session created",
            url:session.url,
        })
        


    },

    success:async(req,res)=>{
        const { userId,user,session} = sValue
        
    console.log(sValue,'hiii');
    console.log(user)
        // const userid =  userId;
        

        const cartItems = user.cart;
    console.log(cartItems)
        

         
      const orders = await Order.create({
        userId: userId,
        products:cartItems.map((value)=> new mongoose.Types.ObjectId(value._id),
        ),
        order_id: session.id,
        payment_id: `demo ${Date.now()}`,
        total_amount: session.amount_total / 100,
      }); 

      if(!orders){
        return res.json({ status:"failure",message:"Error occured while inputting to order DB"})
      }

      const orderId = orders._id; 

      const userUpdate = await User.findOneAndUpdate(
        { _id: userId },
        {
            $push: { orders: orderId },
            $set: { cart: [] }
        },
        { new: true }
    )

      console.log(userUpdate);

       if(userUpdate){
         res.status(200).json({
            status:"success",
            message:"payment successful"
        
         });
       }else{
        res.status(500).json({
            status:"error",
            message:"Failed to update user data",
        });
       }
    
    },

    orderDetails: async(req,res)=>{
        const userId = req.params.id;

        const user = await User.findById(userId).populate("orders");

        if(!user){
            return res.status(404).json({
                status:"failed",
                message:"user not found",
            });
        }
        const orderProducts = user.orders;

        if(orderProducts.length===0){
            return res.status(200).json({
                message:"you don't have any product orders",
                data:[],
            })
        }
        const orderWithProducts = await Order.find({_id:{$in:orderProducts}}).populate("products");

        res.status(200).json({
            message:"ordered Products Details found",
            data:orderWithProducts
        });
    },


    




 }


