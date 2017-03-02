const amqp = require('amqplib/callback_api')
const basename = require('path').basename
const uuid = require('node-uuid')

let n 

try {
    if(process.argv.length < 3) {
        throw Error('Too few args')
        n = parseInt(process.argv[2])
    }
}
catch(e) {
    console.error(e)
    console.warn('Usage %s number', basename(process.argv[1]))
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
    if(err !== null) {
        return bail(err, conn)
    }

    // 消息的关联id
    let correlationsId = uuid()
    
    function maybeAnswer(msg) {
        if(msg.properties.correlationId == correlationsId) {
            console.log(`[.] got ${msg.content.toString()}`)
        } else {
            return bail(new Error('Unexpected message'), conn)
        }

        ch.close(function() {
            conn.close()
        })
    }

    ch.assertQueue('', {exclusive: true}, function(err, ok) {
        if(err !== null) {
            return bail(err, conn)
        }
        let queue = ok.queue
        ch.consume(queue, maybeAnswer, {noAck: true})
        console.log(`[x] Requesting lib${n}`)

        ch.sendToQueue('rpc_queue', new Buffer(n.toString()), {replyTo: queue, correlationId: correlationsId})
    })
}

amqp.connect('amqp://localhost', onConnect)


