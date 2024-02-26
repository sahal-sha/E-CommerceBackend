const express=require("express")
const router=express.Router()
const admin=require("../controller/adminController")
const verifyToken=require("../middleware/adminAuthMiddleware")
const imageUpload=require("../middleware/imageUpload/imageUpload")
const tryCatchMiddleware=require("../middleware/trycatch")
const adminController = require("../controller/adminController")


router
.post("/login",tryCatchMiddleware(admin.login))


.use(verifyToken)
.get("/users",tryCatchMiddleware(admin.allUser))
.get("/users/:id",tryCatchMiddleware(admin.useById))
.post("/products",imageUpload,tryCatchMiddleware(admin.createProduct))


module.exports=router
