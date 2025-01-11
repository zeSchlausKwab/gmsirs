'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nostrService } from '@/services/ndk'
import { NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { useState } from 'react'
import { NostrConnectQRDialog } from './NostrConnectQRDialog'

export function NostrConnect() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [connectionUrl, setConnectionUrl] = useState('')

  const handleCreateConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const ndk = nostrService.getNDK()
      if (!ndk.signer) {
        throw new Error('No signer available')
      }

      const user = await ndk.signer.user()
      const pubkey = user?.pubkey
      if (!pubkey) {
        throw new Error('No pubkey available')
      }

      // Create connection URL
      const host = window.location.protocol + '//' + window.location.host
      const params = new URLSearchParams()
      params.set('relay', 'ws://localhost:3002')
      params.set('name', 'My Nostr App')
      params.set('url', host)
      const url = `nostrconnect://${pubkey}?${params.toString()}`

      // Create NIP-46 signer immediately
      const nip46signer = new NDKNip46Signer(ndk, url)

      // Show QR code while waiting for connection
      setConnectionUrl(url)
      setShowQR(true)

      // Wait for connection
      await nip46signer.blockUntilReady()

      // Update NDK with new signer
      ndk.signer = nip46signer
      setConnected(true)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection')
      console.error('Connection error:', err)
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    const ndk = nostrService.getNDK()
    ndk.signer = new NDKPrivateKeySigner(process.env.NEXT_PUBLIC_DEFAULT_PRIVATE_KEY || '')
    setConnected(false)
    setConnectionUrl('')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Connect Remote Signer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex gap-2">
            {connected ? (
              <Button onClick={handleDisconnect}>Disconnect</Button>
            ) : (
              <Button onClick={handleCreateConnection} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect with QR Code'}
              </Button>
            )}
          </div>

          {loading && <div className="text-sm text-muted-foreground">Waiting for connection...</div>}
          {connected && <div className="text-sm text-green-500">Successfully connected to remote signer</div>}
        </CardContent>
      </Card>

      <NostrConnectQRDialog open={showQR} onOpenChange={setShowQR} connectionUrl={connectionUrl} />
    </>
  )
}
