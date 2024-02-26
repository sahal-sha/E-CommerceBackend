const mongoos = require("mongoose")

const userSchema=new mongoos.Schema({

    name:String,
    email:String,
    username:String,
    password:String,

    cart: [{type:mongoos.Schema.ObjectId,ref:'Product',autopopulate:true}],
    wishlist:[{type:mongoos.Schema.ObjectId,ref:'Product'}]

})

module.exports=mongoos.model("user",userSchema)