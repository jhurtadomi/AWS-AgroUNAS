const amqp = require('amqplib');

/**
 * Envia un evento a la cola de RabbitMQ
 * @param {Object} contenido - El objeto JSON con los datos del movimiento
 */
async function enviarEvento(contenido) {
    try {
        // En local usa localhost, en AWS usará la URL del servicio de K8s
        const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq-console.agromarket.aws.internal/';
        const conexion = await amqp.connect(url);
        const canal = await conexion.createChannel();
        const cola = 'inventory_updates';

        // Asegura que la cola exista
        await canal.assertQueue(cola, { durable: true });
        
        // Envia el mensaje como Buffer
        canal.sendToQueue(cola, Buffer.from(JSON.stringify(contenido)), {
            persistent: true
        });

        console.log(`\x1b[32m[RabbitMQ]\x1b[0m Evento enviado con éxito: ${contenido.accion}`);
        
        // Cerramos la conexión después de un breve delay
        setTimeout(() => conexion.close(), 500);
    } catch (error) {
        console.error("\x1b[31m[RabbitMQ] Error:\x1b[0m", error.message);
    }
}

module.exports = { enviarEvento };