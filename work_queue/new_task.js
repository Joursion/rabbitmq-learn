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

    let q = 'task_queue'
    
    conn.createChannel(function(err, ch) {
        if(err !== null) {
            bail(err, conn)
        }

        ch.assertQueue(q, {durable: true}, function(err, _ok) {
            if(err !== null) {
                return bail(err, conn)
            }

            let msg = process.argv.slice(2).join(' ') || 'Hello World!'

            ch.sendToQueue(q, new Buffer(msg), {persistent: true})
            console.log('[x] sent', msg)
            ch.close(function() {
                conn.close()
            })
        })
    })
}

amqp.connect(url, onConnect)