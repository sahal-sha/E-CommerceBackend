const express=require("express")
const router=express.Router()
const userController=require("../controller/userController")
const tryCatchMiddleware=require("../middleware/trycatch")
const verifyToken=require("../middleware/userAuth")

router

.post("/register",tryCatchMiddleware(userController.userRegister))
.post("/userlogin",tryCatchMiddleware(userController.userLogin))
.use(verifyToken)
.get("/viewProduct",tryCatchMiddleware(userController.viewProduct))
.get("/products/:id",tryCatchMiddleware(userController.productById))
.post("/addCart/:id",tryCatchMiddleware(userController.addToCart))
.get("/viewCart/:id",tryCatchMiddleware(userController.viewCartProduct))


module.exports=router