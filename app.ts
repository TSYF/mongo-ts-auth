import express from "express";
import { authRouter } from './app/routers/authRouter';
const morgan = require("morgan");


const app = express();

app.use(express.json())
app.use(morgan("combined"));

app.use("/auth", authRouter);


app.listen(process.env.PORT, () => {
    console.log("LISTENING");
})