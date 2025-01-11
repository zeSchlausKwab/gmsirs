'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { CopyIcon } from 'lucide-react'

interface NostrConnectQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionUrl: string
}

export function NostrConnectQRDialog({ open, onOpenChange, connectionUrl }: NostrConnectQRDialogProps) {
  if (!connectionUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan with NIP-46 App</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <QRCodeSVG value={connectionUrl} size={400} />
          <div className="flex items-center gap-2">
            <Input value={connectionUrl} readOnly onClick={(e) => e.currentTarget.select()} />
            <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(connectionUrl)}>
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
