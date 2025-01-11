'use client'

import { useState } from 'react'
import { NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { nostrService } from '@/services/ndk'

export function NostrConnect() {
  const [connectUrl, setConnectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const ndk = nostrService.getNDK()
      const nip46signer = new NDKNip46Signer(ndk, connectUrl)
      await nip46signer.blockUntilReady()

      // Update NDK instance with new signer
      ndk.signer = nip46signer

      setConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to signer')
      console.error('Signer connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    const ndk = nostrService.getNDK()
    // Revert to default private key signer
    ndk.signer = new NDKPrivateKeySigner(process.env.NEXT_PUBLIC_DEFAULT_PRIVATE_KEY || '')
    setConnected(false)
    setConnectUrl('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Remote Signer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>NIP-46 Connect URL</Label>
          <Input
            value={connectUrl}
            onChange={(e) => setConnectUrl(e.target.value)}
            placeholder="nostr+walletconnect://..."
            disabled={connected || loading}
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <Button
          onClick={connected ? handleDisconnect : handleConnect}
          disabled={loading || (!connectUrl && !connected)}
        >
          {loading ? 'Connecting...' : connected ? 'Disconnect' : 'Connect'}
        </Button>

        {connected && <div className="text-sm text-green-500">Successfully connected to remote signer</div>}
      </CardContent>
    </Card>
  )
}
