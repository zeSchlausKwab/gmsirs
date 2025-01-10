'use client'

import { useEffect, useState } from 'react'
import { 
  subscribeToFollowingList, 
  type FollowingUpdate, 
  PublicKeySchema, 
  type UserContacts 
} from '@monorepo/common'
import { nostrService } from '@/services/ndk'
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

export function FollowingList({ pubkey }: { pubkey: string }) {
  // Validate pubkey prop
  useEffect(() => {
    const result = PublicKeySchema.safeParse(pubkey)
    if (!result.success) {
      console.error('Invalid pubkey:', result.error)
    }
  }, [pubkey])

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
    <Card>
      <CardHeader>
        <CardTitle>Following List</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pubkey</TableHead>
                <TableHead>Short Form</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(following).map(followedPubkey => (
                <TableRow key={followedPubkey}>
                  <TableCell className="font-mono text-sm">
                    {followedPubkey}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {followedPubkey.slice(0, 8)}...
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