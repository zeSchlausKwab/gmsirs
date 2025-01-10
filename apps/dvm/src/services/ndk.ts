import NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load root .env file
config({ path: resolve(__dirname, '../../../../.env') })

const PRIVATE_KEY = process.env.DVM_PRIVATE_KEY
if (!PRIVATE_KEY) {
  throw new Error('DVM_PRIVATE_KEY environment variable is required')
}

class DVMService {
  private static instance: DVMService
  private ndk: NDK

  private constructor() {
    const signer = new NDKPrivateKeySigner(PRIVATE_KEY)
    this.ndk = new NDK({
      explicitRelayUrls: [
        'ws://localhost:3002',
        // 'wss://relay.nostr.band',
        // 'wss://relay.damus.io'
      ],
      signer
    })
  }

  public static getInstance(): DVMService {
    if (!DVMService.instance) {
      DVMService.instance = new DVMService()
    }
    return DVMService.instance
  }

  public async connect(): Promise<void> {
    await this.ndk.connect()
  }

  public getNDK(): NDK {
    return this.ndk
  }
}

export const dvmService = DVMService.getInstance() 