/* eslint-env node */
import { Kafka as KafkaClient, KafkaConfig, Producer } from 'kafkajs'

// Map to manage multiple producer instances
const producers = new Map<string, Producer>()

// Helper function to initialize and return a producer for a specific client ID
const getProducer = async (config: KafkaConfig, clientId: string) => {
  if (!producers.has(clientId)) {
    console.log(`Creating and connecting the Kafka producer for client "${clientId}"...`)
    const kafka = new KafkaClient(config)

    const producer = kafka.producer()

    try {
      // Connect the producer once
      await producer.connect()
      console.log(`Kafka producer for client "${clientId}" connected.`)
      producers.set(clientId, producer)
    } catch (error) {
      console.error(`Error connecting Kafka producer for client "${clientId}":`, error)
      throw error
    }
  }

  return producers.get(clientId)
}

export const produceMessage = async (
  clientId: string,
  config: KafkaConfig,
  topicName: string,
  key: string,
  value: string,
) => {
  const producerInstance = await getProducer(config, clientId)
  try {
    if (!producerInstance) throw new Error('Failed to get producer instance')

    await producerInstance.send({
      topic: topicName,
      messages: [
        {
          key: key,
          value: JSON.stringify(value),
        },
      ],
    })
    console.log(
      `Message produced to topic "${topicName}" with key "${key}" by client "${clientId}"`,
    )
  } catch (error) {
    console.error(`Failed to produce message by client "${clientId}":`, error)
  }
}

// Graceful shutdown function for all producers
export const shutdownProducers = async () => {
  for (const [clientId, producer] of producers.entries()) {
    try {
      console.log(`Disconnecting Kafka producer for client "${clientId}"...`)
      await producer.disconnect()
      console.log(`Kafka producer for client "${clientId}" disconnected.`)
    } catch (err) {
      console.error(`Error during Kafka producer disconnect for client "${clientId}":`, err)
    }
  }
  producers.clear()
}
