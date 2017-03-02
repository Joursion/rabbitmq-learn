const express = require('express')
const orderModel = require('./ordermodel')

const app = express()
const port = 3000
const maxCount = 100 //最大的订单数

app.get('/', function(req, res) {
    res.send('hello world, listen port', port)
})

app.get('/buy/:userid([0-9]+)', function(req, res) {
    let userid = req.params.userid
    orderModel.countAll({}, function(err, orderCount) {
        if(err) {
            return res.status(500).send(err)
        }
        if(orderCount >= maxCount) {
            return res.send('sold out!')
        } else {
            orderModel.insertOneByObj({
                'userId': userid,
                'writeTime' : new Date()
            }, function(err, obj) {
                if(err) {
                    return res.status(500).send(err)
                }
                return res.send('buy sucess, orderid', obj._id.toString())
            })
        }
    })
})


app.listen(port)
console.log('server listen on ', port)