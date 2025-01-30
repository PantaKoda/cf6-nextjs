"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { SignUpModal } from "./signup-modal"
import { LoginModal } from "./login-modal"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserCircle } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600 font-poppins">ShipTracker</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5" />
                        <span>{session.user?.email}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <>
                    <LoginModal />
                    <SignUpModal />
                  </>
              )}
            </div>
          </div>
        </div>
      </nav>
  )
}

