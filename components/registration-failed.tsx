'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function RegistrationFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            We&apos;re sorry, but we couldn&apos;t complete your registration at this time.
          </p>
          <p className="text-sm text-muted-foreground">
            This could be due to:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
            <li>A network error</li>
            <li>The email address is already in use</li>
            <li>Invalid information provided</li>
          </ul>
        </CardContent>

      </Card>
    </div>
  )
}