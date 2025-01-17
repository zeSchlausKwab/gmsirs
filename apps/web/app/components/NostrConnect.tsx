'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nostrService } from '@/services/ndk'
import { NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { useEffect, useState } from 'react'
import { BunkerConnectDialog } from './BunkerConnectDialog'
import { NostrConnectQRDialog } from './NostrConnectQRDialog'

export function NostrConnect() {
  const [showConnectBunkerScanner, setShowConnectBunkerScanner] = useState(false)
  const [showConnectQR, setShowConnectQR] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnectBunkerScanner = async (signer: NDKNip46Signer) => {
    const ndk = nostrService.getNDK()
    ndk.signer = signer

    const user = await ndk.signer.user()
    const profile = await user.fetchProfile()
    console.log(profile)

    setConnected(true)
  }

  const handleConnectQR = async (signer: NDKNip46Signer) => {
    const ndk = nostrService.getNDK()
    ndk.signer = signer

    const user = await ndk.signer.user()
    const profile = await user.fetchProfile()
    console.log(profile)

    setConnected(true)
  }

  const handleDisconnect = () => {
    const ndk = nostrService.getNDK()
    ndk.signer = new NDKPrivateKeySigner(process.env.NEXT_PUBLIC_DEFAULT_PRIVATE_KEY || '')
    setConnected(false)
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
              <>
                <Button onClick={() => setShowConnectBunkerScanner(true)}>Scan Bunker QR</Button>
                <Button onClick={() => setShowConnectQR(true)}>Show connection QR</Button>
              </>
            )}
          </div>
          {connected && <div className="text-sm text-green-500">Successfully connected to bunker</div>}
        </CardContent>
      </Card>

      <BunkerConnectDialog
        open={showConnectBunkerScanner}
        onOpenChange={setShowConnectBunkerScanner}
        onConnect={handleConnectBunkerScanner}
      />
      <NostrConnectQRDialog open={showConnectQR} onOpenChange={setShowConnectQR} onDone={handleConnectQR} />
    </>
  )
}
