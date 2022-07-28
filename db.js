const mongoose = require("mongoose")
dataSchema = new mongoose.Schema({
    status: String,
    name: String,
    pic: String,
    href: String,
    ingredient: String
})

const data = mongoose.model('rec_dip', dataSchema)
module.exports = data