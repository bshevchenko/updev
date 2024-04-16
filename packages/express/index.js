const express = require("express")
const cors = require("cors")
const fs = require("fs")

require("dotenv").config({ path: __dirname + "/../hardhat/.env" })

const app = express()

fs.readdirSync("./routes/").map(fn => {
    const name = fn.replace(".js", "")
    app.post("/" + name, require("./routes/" + name));
})

app.use(cors());

app.listen(8000, () => {
    console.log("Listening 8000...");
})
