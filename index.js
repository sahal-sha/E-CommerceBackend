require("dotenv").config();
const mongoose=require("mongoose");
const express= require("express")
const bodyParser=require('body-parser')
const app=express()
const port=3001
const adminRouter=require("./routes/adminRouter")
const userRouter=require("./routes/userRouter")



// const mongodb="mongodb://localhost:/ecommerce";


main().catch((err)=>{
    console.log(err); 
})

async function main() {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/ecommerce", {
            
            
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    }
}

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


app.use(express.json())
app.use("/api/admin",adminRouter) 
app.use("/api/user",userRouter)




app.listen(port,()=>{
    console.log("server is running on port",port);
})