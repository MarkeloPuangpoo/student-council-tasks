'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LogIn, ClipboardList, UserCircle2, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/', label: 'ตารางงาน', icon: ClipboardList },
    { href: '/calendar', label: 'ปฏิทิน', icon: null },
    { href: '/statistics', label: 'สถิติ', icon: null },
  ]

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-gray-900/5' 
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-100'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 p-2.5 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ClipboardList className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                SapaBBV
              </span>
              <span className="text-xs text-gray-500 -mt-1">Student Council</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'text-sky-600 bg-sky-50'
                      : 'text-gray-600 hover:text-sky-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </div>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-sky-50 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {user ? (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600">
                    <UserCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">{user.email?.split('@')[0]}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 group"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                  <span>ออกจากระบบ</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/login">
                  <Button className="bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-500 hover:via-blue-600 hover:to-blue-800 flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
                    <LogIn className="h-4 w-4" />
                    <span>เข้าสู่ระบบ</span>
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-sky-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 rounded-xl text-gray-600 hover:text-sky-600 hover:bg-gray-50 font-medium transition-all duration-200 ${
                        isActive(item.href) ? 'text-sky-600 bg-sky-50 border border-sky-100' : ''
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5" />}
                        <span>{item.label}</span>
                        {isActive(item.href) && (
                          <motion.div
                            className="w-2 h-2 bg-sky-500 rounded-full ml-auto"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
              
              <div className="pt-4 border-t border-gray-200/50">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="px-4 py-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600">
                        <UserCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">{user.email?.split('@')[0]}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                      onClick={() => {
                        signOut()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
                      <span>ออกจากระบบ</span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Link
                      href="/login"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-500 hover:via-blue-600 hover:to-blue-800 flex items-center justify-center gap-2 transition-all duration-300">
                        <LogIn className="h-5 w-5" />
                        <span>เข้าสู่ระบบ</span>
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 