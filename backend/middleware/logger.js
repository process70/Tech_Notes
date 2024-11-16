const {format} = require("date-fns")
const {v4 : uuid} = require("uuid")
const fs = require("fs")
const fsPromises = fs.promises
const path = require("path")

const logEvents = async(message, logFileName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`
    try {
        const pathName = path.join(__dirname, "..", "logs");
        if(!fs.existsSync(pathName)){
            await fsPromises.mkdir(pathName)
        }
        // fsPromises.appendFile(`../logs/'+${logFileName}`)
        await fsPromises.appendFile(path.join(__dirname, "..", "logs", logFileName), logItem)
    } catch (error) {
        console.error(error)
    }
}
const logger = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = {logEvents, logger}