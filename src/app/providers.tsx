'use client'

import { AuthProvider } from "@/contexts/auth-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Navbar from "@/components/navbar"

const queryClient = new QueryClient()

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </AuthProvider>
    </QueryClientProvider>
  )
} 