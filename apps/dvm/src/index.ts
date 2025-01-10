import { dvmService } from './services/ndk'
import { NDKEvent, NDKFilter, type NDKSubscription } from '@nostr-dev-kit/ndk'
import { DVMRequestSchema, type DVMRequest } from '@monorepo/common'

const JOB_KIND = 5000
const RESULT_KIND = 6000

async function processRequest(event: NDKEvent): Promise<string> {
  try {
    // Parse the content as JSON and validate
    const content = JSON.parse(event.content)
    const result = DVMRequestSchema.safeParse(content)
    
    if (!result.success) {
      throw new Error('Invalid request format')
    }

    const request = result.data
    let output = request.input

    // Process based on options
    if (request.options?.uppercase) {
      output = output.toUpperCase()
    }
    if (request.options?.reverse) {
      output = output.split('').reverse().join('')
    }

    return output
  } catch (error) {
    console.error('Error processing request:', error)
    throw error
  }
}

async function handleEvent(event: NDKEvent) {
    console.log('Handling event:', event)
  try {
    const output = await processRequest(event)
    
    // Create response event
    const responseEvent = new NDKEvent(dvmService.getNDK())
    responseEvent.kind = RESULT_KIND
    responseEvent.tags = [
      ['e', event.id], // Reference to request event
      ['p', event.pubkey] // Reference to requester
    ]
    responseEvent.content = JSON.stringify({
      input: JSON.parse(event.content).input,
      output,
      processedAt: Date.now()
    })

    // Publish response
    await responseEvent.publish()
  } catch (error) {
    console.error('Error handling event:', error)
  }
}

async function main() {
  await dvmService.connect()
  console.log('DVM connected to relays')

  const filter: NDKFilter = { kinds: [JOB_KIND] }
  const sub = dvmService.getNDK().subscribe(filter)
  
  sub.on('event', handleEvent)
  
  console.log('DVM listening for requests...')
}

main().catch(console.error) 