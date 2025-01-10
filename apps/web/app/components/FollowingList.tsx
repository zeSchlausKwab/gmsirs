'use client'

import { useEffect, useState } from 'react'
import { 
  subscribeToFollowingList, 
  type FollowingUpdate, 
  PublicKeySchema, 
  type UserProfile 
} from '@monorepo/common'
import { nostrService } from '@/services/ndk'
import type { NDKUser } from '@nostr-dev-kit/ndk'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type ProfileWithStatus = {
  profile: NDKUser | null
  loading: boolean
}

export function FollowingList({ pubkey }: { pubkey: string }) {
  useEffect(() => {
    const result = PublicKeySchema.safeParse(pubkey)
    if (!result.success) {
      console.error('Invalid pubkey:', result.error)
    }
  }, [pubkey])

  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [profiles, setProfiles] = useState<Map<string, ProfileWithStatus>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  // Fetch profile for a single pubkey
  const fetchProfile = async (pubkey: string) => {
    setProfiles(prev => new Map(prev).set(pubkey, { profile: null, loading: true }))
    
    try {
      const user = await nostrService.getNDK().getUser({ pubkey })
      await user.fetchProfile()
      setProfiles(prev => new Map(prev).set(pubkey, { profile: user, loading: false }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfiles(prev => new Map(prev).set(pubkey, { profile: null, loading: false }))
    }
  }

  useEffect(() => {
    setIsLoading(true)
    setFollowing(new Set())
    setProfiles(new Map())

    const handleUpdate = (update: FollowingUpdate) => {
      if (update.type === 'add' && update.pubkey) {
        setFollowing(prev => new Set([...prev, update.pubkey!]))
        fetchProfile(update.pubkey)
      } else if (update.type === 'complete') {
        setIsLoading(false)
      }
    }

    nostrService.connect().then(() => {
      const cleanup = subscribeToFollowingList(
        nostrService.getNDK(),
        pubkey,
        50, // Max followers to display
        handleUpdate
      )

      return () => cleanup()
    })
  }, [pubkey])

  const ProfileCell = ({ pubkey }: { pubkey: string }) => {
    const profileData = profiles.get(pubkey)
    
    if (!profileData || profileData.loading) {
      return (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      )
    }

    const profile = profileData.profile
    return (
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={profile?.profile?.image} alt={profile?.profile?.name || 'Unknown'} />
          <AvatarFallback>{profile?.profile?.name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{profile?.profile?.name || 'Anonymous'}</div>
          <div className="text-sm text-muted-foreground font-mono">
            {pubkey.slice(0, 8)}...
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Following List</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && following.size === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>NIP-05</TableHead>
                <TableHead>About</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(following).map(followedPubkey => (
                <TableRow key={followedPubkey}>
                  <TableCell>
                    <ProfileCell pubkey={followedPubkey} />
                  </TableCell>
                  <TableCell>
                    {profiles.get(followedPubkey)?.profile?.profile?.nip05 || '-'}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {profiles.get(followedPubkey)?.profile?.profile?.about || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 