const amqp = require('amqplib')

const url = 'amqp://127.0.0.1'

amqp.connect(url).then(function(conn) {
    process.once('SIGINT', function() {
        conn.close()
    })

    return conn.createChannel().then(function(ch) {

        //监听hello 队列， 不进行持久化
        let ok = ch.assertQueue('hello', {durable: false})

        ok = ok.then(function(_qok) {
            //消费hello 队列
            return ch.consume('hello', function(msg) {
                console.log("[x] recieved '%s'", msg.content.toString())
            }, {noAck: true})
        })

        return ok.then(function(_comsumeOk) {
            console.log('[*] waiting for message. to exit press ctrl+c')
        })
    })
}).then(null, console.warn)

