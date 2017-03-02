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
        bail(err)
    }

    let ex = 'logs'  //Exchange name

    function onChannelOpen(err, ch) {
        if(err !== null) {
            return bail(err, conn)
        }

        ch.assertExchange(ex, 'fanout', {durable: false})

        let msg = process.argv.slice(2).join(' ') || 'info: Hello World!'

        ch.publish(ex, '', new Buffer(msg)) // 推送消息给Exchange 节点
        console.log('[x] sent: ', msg)
        ch.close(function() {
            conn.close()
        })
    }

    conn.createChannel(onChannelOpen)
}

amqp.connect(url, onConnect)