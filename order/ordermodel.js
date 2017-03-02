const mongoose = require('mongoose')

const url = 'mongodb://127.0.0.1:27017/http_vs_rabbit'

const poolSize = 50

mongoose.connect(url, {server: {poolSize: poolSize}})

const Schema = mongoose.Schema

const obj = {
    userId: {type: Number, required: true},
    writeTime: {type: Date, default: Date.now()}
}

const objSchema = new Schema(obj)

objSchema.static.countAll = function(obj, cb) {
    return this.count(obj || {}, cb)
}

objSchema.static.insertOneByObj = function(obj, cb) {
    return this.create(obj || {}, cb)
}
module.exports = mongoose.model('orders', objSchema)