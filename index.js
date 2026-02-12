require('dotenv').config();
const express=require('express')
const connectDB=require('./db');
const cookieParser=require('cookie-parser')
const cors=require('cors')
const route=require('./src/routes/index')

const app=express();
app.use(express.json());
app.use(cookieParser()); //allows the jwt token accessed from the frontend
app.use(cors({
    origin:["http://localhost:5173","https://event-frontend-xi-six.vercel.app","https://event-frontend-xi-six.vercel.app"],
    methods:["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
    credentials:true
}));
// app.get("/",(req,res)=>{
//     res.send("hello");
// })

app.use('/event/api/v1',route);

app.listen(3000,()=>{
    console.log("server runs on 3000 port");
    connectDB();
});


