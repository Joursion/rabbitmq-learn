const amqp = require('amqplib/callback_api')

const url = 'amqp://localhost'

let args = process.argv.slice(2)
let serverity = (args.length >0 ) ? args[0] : 'info'
let message = args.slice(1).join(' ') || 'Hello World'

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

    let ex = 'derict_logs'
    let exopts = {durable: false}

    function onChannelOpen(err, ch) {
        if(err) {
            return bail(err, conn)
        }
        
        ch.assertExchange(ex, 'derict', exopts, function(err, ok) {
            ch.publish(ex, serverity, new Buffer(message))
            ch.close(function() {
                conn.close()
            })
        })
    }
    conn.createChannel(onChannelOpen)
}

amqp.connect(url, onConnect)
