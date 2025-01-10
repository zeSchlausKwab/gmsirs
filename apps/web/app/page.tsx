'use client'

import { useState } from 'react'
import { isValidEmail, formatPhoneNumber } from '@monorepo/common'
import { FollowingList } from './components/FollowingList'
import { DVMTest } from './components/DVMTest'
import { RelayDebugger } from './components/RelayDebugger'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export default function Home() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValidEmail: boolean
    formattedPhone: string
  } | null>(null)

  const handleValidate = async () => {
    const localValidation = {
      isValidEmail: isValidEmail(email),
      formattedPhone: formatPhoneNumber(phone)
    }
    
    const response = await fetch('http://localhost:3001/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, phone }),
    })
    
    const serverValidation = await response.json()
    
    setValidationResult({
      isValidEmail: localValidation.isValidEmail && serverValidation.isValidEmail,
      formattedPhone: serverValidation.formattedPhone
    })
  }

  const testPubkey = '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'

  return (
    <main className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Validation Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          
          <div className="space-y-2">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone"
            />
          </div>
          
          <Button onClick={handleValidate}>
            Validate
          </Button>
          
          {validationResult && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                {validationResult.isValidEmail ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
                <span>
                  Email is {validationResult.isValidEmail ? 'valid' : 'invalid'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                <span>
                  Formatted phone: {validationResult.formattedPhone}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DVMTest />
      <RelayDebugger />
      <FollowingList pubkey={testPubkey} />
    </main>
  )
} 