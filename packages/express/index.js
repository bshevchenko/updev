const express = require("express")
const cors = require("cors")
const fs = require("fs")

require("dotenv").config({ path: __dirname + "/../hardhat/.env" })

// TODO production modifications
// TODO vercel serverless functions?

const app = express()

app.use(cors()); // TODO keep? allow only certain domain?

fs.readdirSync("./routes/").map(fn => {
    const name = fn.replace(".js", "")
    app.get("/" + name, require("./routes/" + name)); // TODO post
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(8000, () => { // TODO
    console.log("Listening 8000...");
})
