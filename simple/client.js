const amqp = require('amqplib')
const when = require('when')

const url = 'amqp://localhost'

amqp.connect(url).then(function(conn) {
    return when(conn.createChannel().then(function(ch) {
        let q = 'hello'
        let msg = 'Hello World!'

        let ok = ch.assertQueue(q, {durable: false})

        return ok.then(function(_qok) {
            ch.sendToQueue(q, new Buffer(msg))
            console.log(`[x] sent message ${msg}`)
            return ch.close()
        })
        // ensure 类似Promise.finall
    })).ensure(function() {
        conn.close()
    })
}).then(null, console.warn)




