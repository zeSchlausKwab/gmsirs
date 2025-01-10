import NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'

// TODO: Move to env variables
const PRIVATE_KEY = '5c81bffa8303bbd7726d6a5a1170f3ee46de2addabefd6a735845166af01f5c0' // Replace with your test private key

const defaultRelays = process.env.NEXT_PUBLIC_DEFAULT_RELAYS 
  ? JSON.parse(process.env.NEXT_PUBLIC_DEFAULT_RELAYS)
  : ['ws://localhost:3002']

class NostrService {
  private static instance: NostrService
  private ndk: NDK

  private constructor() {
    const signer = new NDKPrivateKeySigner(PRIVATE_KEY)
    this.ndk = new NDK({
      explicitRelayUrls: [
        ...defaultRelays,
        'wss://relay.damus.io',
        'wss://relay.nostr.band',
        'ws://localhost:3002'
      ],
      signer
    })
  }

  public static getInstance(): NostrService {
    if (!NostrService.instance) {
      NostrService.instance = new NostrService()
    }
    return NostrService.instance
  }

  public async connect(): Promise<void> {
    await this.ndk.connect()
  }

  public getNDK(): NDK {
    return this.ndk
  }
}

export const nostrService = NostrService.getInstance() 