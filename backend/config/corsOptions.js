const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
    origin: (origin, callback) => {
        // "!origin": same-origin requests means from some non-browser clients like postman
        // allowedOrigins.indexOf(origin): checks if origin is in allowedOrigins array
        // -1: origin is not in the array, so the request is not allowed by CORS
        // null: no error, allow the request
        // callback(new Error("Not allowed by CORS")): error message if origin is not allowed by CORS
        if(!origin || allowedOrigins.indexOf(origin) !== -1) { 
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    // This allows the server to accept credentials (like cookies, authorization headers) from the allowed origins.
    credentials: true
}
/* const corsOptions = {
    origin: (origin) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return true;
        }
        return false;
    },
    credentials: true,
    optionsSuccessStatus: 204
}; */
module.exports = corsOptions