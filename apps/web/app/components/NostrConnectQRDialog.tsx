'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { CopyIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { nostrService } from '@/services/ndk'
import { NDKEvent, NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { nip04 } from 'nostr-tools'
interface NostrConnectQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: (signer: NDKNip46Signer) => void
}

export function NostrConnectQRDialog({ open, onOpenChange, onDone }: NostrConnectQRDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionUrl, setConnectionUrl] = useState<string | null>(null)
  const [tempPubkey, setTempPubkey] = useState<string | null>(null)

  const createConnectionUrl = (pubkey: string) => {
    const localMachineIp = process.env.NEXT_PUBLIC_LOCAL_MACHINE_IP
    const relay = `ws://${localMachineIp}:3002`
    const host = location.protocol + '//' + localMachineIp

    const params = new URLSearchParams()
    params.set('relay', relay)
    params.set('name', 'GMsirs')
    params.set('url', host)
    params.set('image', new URL('/apple-touch-icon.png', host).toString())

    return `nostrconnect://${pubkey}?` + params.toString()
  }

  useEffect(() => {
    const setupConnection = async () => {
      const newPkSigner = NDKPrivateKeySigner.generate()
      const user = await newPkSigner.user()
      const pubkey = user.pubkey

      setTempPubkey(pubkey)
      setConnectionUrl(createConnectionUrl(pubkey))

      const ndk = nostrService.getNDK()
      console.log('Listening for events for pubkey:', pubkey)

      const localSigner = NDKPrivateKeySigner.generate()
      // const remoteSigner = new NDKNip46Signer(ndk, token, localSigner)
      // const user = await remoteSigner.blockUntilReady()

      const sub = ndk.subscribe({
        kinds: [24133],
        '#p': [pubkey],
        since: 0,
      })

      sub.on('event', async (event: NDKEvent) => {
        console.log('Event:', event)
        const localMachineIp = process.env.NEXT_PUBLIC_LOCAL_MACHINE_IP
        const relay = `ws://${localMachineIp}:3002`
        const userPubkey = event.author

        const params = new URLSearchParams()
        params.set('relay', relay)
        params.set('secret', Math.random().toString(36).substring(2, 15))

        const finalString = `bunker://${userPubkey.pubkey}?` + params.toString()

        console.log('Final string:', finalString)

        const remoteSigner = new NDKNip46Signer(ndk, finalString, newPkSigner)
        console.log('Remote signer:', remoteSigner)
        const user = await remoteSigner.blockUntilReady()

        console.log('User:', user)

        if (user) {
          onDone(remoteSigner)
        }

        // console.log('Received event:', event)
        // const decodedContent = await nip04.decrypt(newPkSigner.privateKey ?? '', event.pubkey, event.content)
        // const userPubkey = event.pubkey
        // const json = JSON.parse(decodedContent)

        // console.log('JSON:', json)

        // const profile = await event.author.fetchProfile()

        // console.log('Profile:', profile)

        // if (userPubkey) {
        //   console.log('Connection successful')
        //   const newNip46Signer = new NDKNip46Signer(ndk, userPubkey, newPkSigner)

        //   await newNip46Signer.blockUntilReady()

        //   onDone(newNip46Signer)
        // }

        // console.log('Decoded content:', decodedContent)
      })

      return () => {
        sub.stop()
      }
    }

    if (open) {
      setupConnection()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan with NIP-46 App</DialogTitle>
          <DialogDescription>
            Scan this QR code with your NIP-46 compatible app (like Amber) or copy the connection URL below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Waiting for connection...</p>
            </div>
          ) : connectionUrl ? (
            <>
              <QRCodeSVG value={connectionUrl} size={400} />
              <div className="flex items-center gap-2">
                <Input value={connectionUrl} readOnly onClick={(e) => e.currentTarget.select()} />
                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(connectionUrl)}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Generating connection...</p>
            </div>
          )}
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
