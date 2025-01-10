'use client'

import { useEffect, useState } from 'react'
import { subscribeToFollowingList, type FollowingUpdate } from '@monorepo/common'
import { nostrService } from 'apps/web/services/ndk'

export function FollowingList({ pubkey }: { pubkey: string }) {
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    setFollowing(new Set())

    const handleUpdate = (update: FollowingUpdate) => {
      if (update.type === 'add' && update.pubkey) {
        setFollowing(prev => new Set([...prev, update.pubkey!]))
      } else if (update.type === 'complete') {
        setIsLoading(false)
      }
    }

    // Connect NDK if not already connected
    nostrService.connect().then(() => {
      const cleanup = subscribeToFollowingList(
        nostrService.getNDK(),
        pubkey,
        handleUpdate
      )

      return () => cleanup()
    })
  }, [pubkey])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Following List</h2>
      {isLoading && <p>Loading...</p>}
      <ul className="space-y-2">
        {Array.from(following).map(followedPubkey => (
          <li key={followedPubkey} className="font-mono text-sm">
            {followedPubkey}
          </li>
        ))}
      </ul>
    </div>
  )
} 