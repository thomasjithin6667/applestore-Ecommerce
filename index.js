const mongoose = require("mongoose");
const adminRoute= require("./routes/adminRoute")
const userRoute= require("./routes/userRoute")
const express= require("express");





mongoose.connect("mongodb://127.0.0.1:27017/apple_store");

const app = express();

//middlewares
app.set('view engine','ejs')
app.set('views','./views/users')
app.use(express.static('public'))
app.use('assets/css',express.static(__dirname+'public'))
app.use("/public", express.static("public", { "extensions": ["js"] }));

//for user route
app.use('/',userRoute)



//for user route
app.use('/admin',adminRoute)


app.use((req, res, next) => {
    res.status(404).render("404-error");
  })

port=3000
app.listen(port,()=>{
    console.log("server running at http://localhost:3000/");

})