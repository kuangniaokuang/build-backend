const amqplib = require('amqplib')
const config = require('../../config/env/resolveConfig')

module.exports = {
  async connect (rabbitMqUrl = config.custom.RABBIT_MQ_URL) {
    return await amqplib.connect(rabbitMqUrl)
  },

  async getChannel () {
    const connection = await module.exports.connect()

    return await connection.createChannel()
  },

  async assertQueue (queueName, options = {}) {
    const channel = await module.exports.getChannel()
    const queue = await channel.assertQueue(queueName, options)

    return queue
  }
}
