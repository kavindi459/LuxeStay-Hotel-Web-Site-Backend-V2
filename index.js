import bodyParser from "body-parser";
import express from "express";
import userRouter from "./src/routes/usersRoute.js";
import connectDB from './src/config/db.js';
import { PORT } from "./src/config/env.js";
import dotenv from 'dotenv';
import errorHandler from './src/middlewares/error.middleware.js';
import galleryItemRouter from "./src/routes/galleryRoute.js";

dotenv.config();
const app = express();


app.use(bodyParser.json());


connectDB();
app.use(errorHandler);

//Routes
app.use("/api/users",userRouter);

app.use("/api/gallery",galleryItemRouter);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}🚀 `);
});

app.use(errorHandler);




 

