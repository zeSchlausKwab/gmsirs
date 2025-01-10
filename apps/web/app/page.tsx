'use client'

import { useState } from 'react'
import { isValidEmail, formatPhoneNumber } from '@monorepo/common'

export default function Home() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValidEmail: boolean
    formattedPhone: string
  } | null>(null)

  const handleValidate = async () => {
    // Client-side validation
    const localValidation = {
      isValidEmail: isValidEmail(email),
      formattedPhone: formatPhoneNumber(phone)
    }
    
    // Server-side validation
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

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Validation Example</h1>
      
      <div className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="border p-2 rounded"
          />
        </div>
        
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone"
            className="border p-2 rounded"
          />
        </div>
        
        <button
          onClick={handleValidate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Validate
        </button>
        
        {validationResult && (
          <div className="mt-4">
            <p>Email is {validationResult.isValidEmail ? 'valid' : 'invalid'}</p>
            <p>Formatted phone: {validationResult.formattedPhone}</p>
          </div>
        )}
      </div>
    </main>
  )
} 