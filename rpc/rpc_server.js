const amqp = require('amqplib/callback_api')

// 模拟耗时的计算
function fib(n) {
    let a = 0
    let b = 0
    for(let i = 0; i < n; i ++) {
        let c = a + b
        a = b
        b = c
    }
    return a
}

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

    let queue = 'rpc_queue'

    conn.createChannel(function(err, ch) {
        ch.assertQueue(queue, {durable: true})
        ch.prefetch(1)
        //noAck false 把无响应设置为false，这条消息在处理之后将会相应给生产者
        ch.consume(queue, reply, {noAck: false}, function(err) {
            if(err !== null) {
                return bail(err, conn)
            }
            console.log('[x] Awaiting RPC request')
        })

        function reply(msg) {
            let n = parseInt(msg.content.toString())
            console.log(`[.] fib(${n})`)
            ch.sendToQueue(msg.properties.replyTo, 
                            new Buffer(fib(n).toString()),
                            {correlationId: msg.properties.correlationId})
            ch.ack(msg)
        }
    })
}

amqp.connect('amqp://localhost', onConnect)


// 检查是否因为ch.ack(msg) 造成内存泄漏
//sudo reabbitmqctl list_queue name message_ready messages_unacknowledged