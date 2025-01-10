import type NDK from '@nostr-dev-kit/ndk'
import { type NDKSubscription, type NDKEvent } from '@nostr-dev-kit/ndk'

export type FollowingUpdate = {
  type: 'add' | 'complete'
  pubkey?: string
}

export function subscribeToFollowingList(
  ndk: NDK, 
  targetPubkey: string, 
  onUpdate: (update: FollowingUpdate) => void
): () => void {
  let subscription: NDKSubscription | undefined

  const cleanup = () => {
    if (subscription) {
      subscription.stop()
      subscription = undefined
    }
  }

  // Set timeout to auto-close subscription
  const timeoutId = setTimeout(() => {
    onUpdate({ type: 'complete' })
    cleanup()
  }, 5000) // Adjust timeout as needed

  const processContactList = async () => {
    subscription = ndk.subscribe(
      {
        kinds: [3], // Contact List
        authors: [targetPubkey],
      },
      { closeOnEose: false }
    )

    subscription.on('event', (event: NDKEvent) => {
      const tags = event.tags
      tags.forEach(tag => {
        if (tag[0] === 'p') {
          onUpdate({ type: 'add', pubkey: tag[1] })
        }
      })
    })
  }

  processContactList()

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId)
    cleanup()
  }
} 