'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LogIn, ClipboardList, UserCircle2, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-blue-700 p-2 shadow-lg">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              SapaBBV
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              ตารางงาน
            </Link>
            <Link 
              href="/calendar" 
              className="text-gray-600 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              ปฏิทิน
            </Link>
            <Link 
              href="/statistics" 
              className="text-gray-600 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              สถิติ
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
                    <UserCircle2 className="h-5 w-5 text-sky-500" />
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>ออกจากระบบ</span>
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-tr from-sky-400 to-blue-700 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:from-sky-500 hover:to-blue-800 flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>เข้าสู่ระบบ</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-sky-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-3 space-y-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:text-sky-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ตารางงาน
              </Link>
              <Link
                href="/calendar"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:text-sky-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ปฏิทิน
              </Link>
              <Link
                href="/statistics"
                className="block px-3 py-2 rounded-lg text-gray-600 hover:text-sky-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                สถิติ
              </Link>
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 rounded-lg bg-gray-50">
                    <UserCircle2 className="h-5 w-5 text-sky-500" />
                    <span className="text-sm font-medium text-gray-700">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span>ออกจากระบบ</span>
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-tr from-sky-400 to-blue-700 text-white font-medium px-5 py-2 rounded-xl shadow-md hover:from-sky-500 hover:to-blue-800 flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" />
                    <span>เข้าสู่ระบบ</span>
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 