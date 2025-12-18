const amqp = require('amqplib');

async function iniciarConsumidor() {
    try {
        const conexion = await amqp.connect('amqp://rabbitmq-console.agromarket.aws.internal/');
        const canal = await conexion.createChannel();
        const cola = 'inventory_updates';

        await canal.assertQueue(cola, { durable: true });
        console.log("\x1b[33m[Worker]\x1b[0m Esperando mensajes de inventario...");

        canal.consume(cola, (msg) => {
            const contenido = JSON.parse(msg.content.toString());
            console.log("-----------------------------------------");
            console.log(`NOTIFICACIÓN RECIBIDA: ${contenido.accion}`);
            console.log(`Producto: ${contenido.data.producto}`);
            console.log(`Por: ${contenido.usuario}`);
            console.log("-----------------------------------------");
            canal.ack(msg);
        });
    } catch (error) {
        console.error("Error en worker:", error);
    }
}

iniciarConsumidor();