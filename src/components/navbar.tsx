'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LogIn, ClipboardList, UserCircle2, Menu, X, LayoutDashboard, Calendar, BarChart3 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

// --- Constants ---
const NAV_ITEMS = [
  { href: '/', label: 'ตารางงาน', icon: LayoutDashboard },
  { href: '/calendar', label: 'ปฏิทิน', icon: Calendar },
  { href: '/statistics', label: 'สถิติ', icon: BarChart3 },
]

// --- Sub-components for better structure ---

const Logo = () => (
  <Link href="/" className="flex items-center gap-3 group">
    <motion.div 
      className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 p-2.5 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105"
      whileHover={{ rotate: -5, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <ClipboardList className="h-6 w-6 text-white" />
    </motion.div>
    <div className="flex flex-col">
      <span className="text-xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700 bg-clip-text text-transparent">
        SapaBBV
      </span>
      <span className="text-xs text-gray-500 -mt-1 tracking-wider">Student Council</span>
    </div>
  </Link>
);

const DesktopNav = ({ pathname }: { pathname: string }) => (
  <div className="hidden md:flex items-center gap-2 bg-gray-50/80 p-1 rounded-full border border-gray-200/50">
    {NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link 
          key={item.href}
          href={item.href} 
          className={cn(
            "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300",
            isActive ? "text-white" : "text-gray-600 hover:text-sky-600"
          )}
        >
          <span>{item.label}</span>
          {isActive && (
            <motion.div
              layoutId="desktop-active-tab"
              className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full -z-10"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </Link>
      );
    })}
  </div>
);

const UserNav = ({ user, signOut }: { user: User | null; signOut: () => void }) => (
  <div className="hidden md:flex items-center">
    {user ? (
      <DropdownMenu user={user} signOut={signOut} />
    ) : (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Link href="/login">
          <Button className="bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <LogIn className="h-4 w-4 mr-2" />
            เข้าสู่ระบบ
          </Button>
        </Link>
      </motion.div>
    )}
  </div>
);

const DropdownMenu = ({ user, signOut }: { user: User | null; signOut: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!user) return null;
  
    return (
      <div className="relative" onMouseLeave={() => setIsOpen(false)}>
        <motion.button
          onMouseEnter={() => setIsOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-blue-100 border border-gray-200"
          whileTap={{ scale: 0.95 }}
        >
            <UserCircle2 className="h-5 w-5 text-blue-600" />
        </motion.button>
  
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            >
              <div className="py-2 px-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.email?.split('@')[0]}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="my-1 h-px bg-gray-200/50" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>ออกจากระบบ</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

// --- Main Navbar Component ---

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-gray-900/5' 
          : 'bg-white/80 backdrop-blur-lg border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Logo />
          <DesktopNav pathname={pathname} />
          <UserNav user={user} signOut={signOut} />
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-sky-600 hover:bg-gray-100"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors duration-200",
                        isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-700 hover:bg-gray-50'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
              
              <div className="pt-4 mt-4 border-t border-gray-200/50">
                {user ? (
                    <UserNavMobile user={user} signOut={signOut} closeMenu={() => setIsMobileMenuOpen(false)} />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white">
                            <LogIn className="h-5 w-5 mr-2" />
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

const UserNavMobile = ({ user, signOut, closeMenu }: { user: User, signOut: () => void, closeMenu: () => void }) => (
    <div className="space-y-3">
        <div className="px-4 py-3 flex items-center gap-3 rounded-xl bg-gray-100">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600">
                <UserCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-gray-800 truncate">{user.email?.split('@')[0]}</span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
        </div>
        <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
                signOut();
                closeMenu();
            }}
        >
            <LogOut className="h-5 w-5 mr-3" />
            <span>ออกจากระบบ</span>
        </Button>
    </div>
);