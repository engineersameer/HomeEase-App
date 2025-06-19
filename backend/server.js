import express from 'express'
import dotenv from "dotenv"
const app=express()

dotenv.config()

const PORT=process.env.PORT
app.get('/',()=>{
    console.log('Hello from the server!')
})
app.listen(5001,()=>{
    console.log('Server is running on port:',PORT)
})