// enable to use the variable environement in all our project
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const {logger,  logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser"); //handler http cookies
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const dbConnect = require("./dbConnection");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");

dbConnect()

app.use(logger);
//our api is available to the public where any website can fetch data from
//third-party middleware
app.use(cors(corsOptions));
//built-in middleware
//enable json content type
app.use(express.json());
app.use(express.urlencoded({extended: true}))
//enable using cookies
app.use(cookieParser())

// app.use(express.static(path.join(__dirname, "public")))
// it's important to note ^/$ when adding multiple routes in a single http request
// app.get("^/$|/index", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.use('/users', userRouter)
app.use('/notes', noteRouter)
app.use('/auth', authRoutes)

// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../frontend/build/index.html'))});

// custom middleware
// handle any express's error or other error related to the server
// res.status = 500
app.use(errorHandler);

mongoose.connection.once('open', () => {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`server running on port ${process.env.PORT}`)
        })
    } catch (err) {
        console.log(err)
    }
})
/* mongoose.connection.on('error', err => {
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
}) */

// mongoose.connection.once('open', () => {
//     console.log('Connected to MongoDB')
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
// })



// in this case it will display a successful connection then it will check if there is any errors
// this approach is not pratically correct 
// mongoose
//   .connect(process.env.DATABASE_URL)
//   .then(() => {
//     console.log("connection successfully to the database");
//     app.listen(process.env.PORT, () => {
//       console.log(`server running on port ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//     logEvents(
//       `${err.name}: ${err.code}\t${err.syscall}\t${err.hostname}`,
//       "mongoErrLog.log"
//     );
//   });
