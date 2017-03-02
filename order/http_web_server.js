const express = require('express')
const request = require('request')
const util = require('util')

const app = express()
var globalUserId = 1

app.get('/', function(req, res) {
    res.send('hello world')
})

const uri = 'http://127.0.0.1:8000/buy/%d'
const timeOut = 30 * 1000

app.get('/buy/', function (req, res) {
    let num = globalUserId ++
    request({
        method: 'GET',
        timeOut: timeOut,
        uri: util.format(uri, num)
    }, function(err, req_res, body) {
        if(err) {
            res.status(500).send(err)
        } else if (req_res.statusCode != 200) {
            res.status(500).send(req_res.statusCode)
        } else {
            res.send(body)
        }
    })
})

app.listen(8000)
console.log('server listen on 5000')