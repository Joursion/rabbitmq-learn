const amqp = require('amqplib/callback_api')

const url = 'amqp://localhost'

function bail(err, conn) {
    console.error(err)
    if(conn) {
        conn.close(function() {
            process.exit(1)
        })
    }
}

function onConnect(err, conn) {
    if(err !== null) {
        return bail(err)
    }

    process.once('SIGINT', function() {
        conn.close()
    })

    let q = 'task_queue'

    conn.createChannel(function(err, ch) {
        if(err !== null) {
            return bail(err, conn)
        }

        ch.assertQueue(q, {durable: true}, function(err, _ok) {
            ch.comsume(q, doWork, {noAck: false}) //把数据放到doWork里面消费
            console.log('[*] Wating for message. To exit press crtl+c')
        })

        function doWork(msg) {
            let body = msg.content.toString()
            console.log(`[x] received ${body}`)
            let secs = body.split('.').length - 1
            setTimeout(function() {
                console.log('[x] Done')
                ch.ack(msg)
            }, secs * 1000)
        }
    })
}

amqp.connect(url, onConnect)