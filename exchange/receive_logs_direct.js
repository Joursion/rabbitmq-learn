const amqp = require('amqplib/callback_api')

const basename = require('path').basename

const serverities = process.argv.slice(2)

if(serverities.length < 1) {
    console.log(`Usage ${basename(process.argv[1])} [info] [warning] [error]`)

    process.exit(1)
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
    if(err) {
        return bail(err)
    }
    process.once('SIGINT', function() {
        conn.close()
    })

    conn.createChannel(function(err, ch) {
        if(err !== null) {
            return bail(err)
        }
        let ex = 'derect_logs'
        let exopts = {durable: false}

        ch.assertExchange(ex, 'derect', exopts)
        ch.assertQueue('', {exclusive: true}, function(err, ok) {
            if(err !== null) {
                return bail(err, conn)
            }
            let queue = ok.queue 
            let i = 0
            
            function sub(err) {
                if(err !== null) {
                    return bail(err, conn)
                    
                } else if (i < serverities.length) {
                    // 绑定serverties[]
                    ch.bindQueue(queue, ex, severities[i], {}, sub)
                    i ++
                }
            }

            ch.consume(queue, logMessage, {noAck: true}, function(err) {
                if(err !== null) {
                    bail(err, conn)
                    console.log('[x] Waiting for logs. To exit press CTRL+C')
                }
                sub(null)
            })
        })
    })
}

function logMessage(msg) {
    console.log(`[x] ${msg.fields.routingKey} ${msg.content.toString()}`)
}

amqp.connect('amqp://localhost', onConnect)