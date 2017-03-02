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

    let ex = 'logs'

    function onChanelOpen(err, ch) {
        if(err !== null) {
            return bail(err, conn)
        }

        ch.assertExchange(ex, 'fanout', {durable: false}, function(err) {
            if(err !== null) {
                return bail(err, conn)
            }

            ch.assertQueue('', {exclusive: true}, function(err, _ok) {
                let q = _ok.queue
                ch.bindQueue(q, ex, '')
                ch.consume(q, logMessage, {noAck: true}, function(err, ok) {
                    if(err !== null) {
                        return bail(err, conn)
                    }
                    console.log('[*] Waiting for logs, To exit press CTRL+C')
                })
            })
        })

        function logMessage(msg) {
            if (msg) {
                console.log('[x] =', msg.content.toString())
            }
        }

    }
    conn.createChannel(onChanelOpen)
}

amqp.connect(url, onConnect)