const mongoose = require("mongoose");
const { logEvents } = require("./middleware/logger");

const dbConnect = async() => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("connection to the database successfully")
    } catch (err) {
        console.log(err)
        logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
    }
}
module.exports = dbConnect