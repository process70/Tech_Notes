const { logEvents } = require("./logger")

const errorLog = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)
    const status = res.statusCode ? res.statusCode : 500   // internal server status code
    res.status(status).send({ message: err.message })
}
module.exports = errorLog