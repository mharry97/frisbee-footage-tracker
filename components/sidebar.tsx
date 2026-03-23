"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { FiDatabase, FiMenu, FiX } from "react-icons/fi"
import { FaRegCalendarAlt } from "react-icons/fa"
import { TbPlaylistAdd } from "react-icons/tb"
import { MdOutlineAdminPanelSettings, MdOutlineScoreboard } from "react-icons/md"
import { IoPeopleOutline, IoSearch } from "react-icons/io5"
import { PiStrategy } from "react-icons/pi"

const baseNavItems = [
  { title: "Sources", href: "/sources", icon: FiDatabase },
  { title: "Events", href: "/events", icon: FaRegCalendarAlt },
  { title: "Playlists", href: "/playlists", icon: TbPlaylistAdd },
  { title: "Strategies", href: "/strategies", icon: PiStrategy },
  { title: "Possessions", href: "/possessions", icon: MdOutlineScoreboard },
  { title: "Teams", href: "/teams", icon: IoPeopleOutline },
  { title: "Player Search", href: "/playersearch", icon: IoSearch },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { player } = useAuth()

  const navItems = [
    ...baseNavItems,
    ...(player?.is_admin
      ? [{ title: "Admin", href: "/admin", icon: MdOutlineAdminPanelSettings }]
      : []),
  ]

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <>
      {/* Mobile floating hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-neutral-100"
      >
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-neutral-900 border-r border-neutral-700 md:bg-transparent md:border-r-0 z-40 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-3 py-6">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <span style={{ fontSize: "1.5rem", fontWeight: 400, paddingLeft: "1rem" }} className="text-yellow-400 tracking-wide">Frisbee Tracker</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{ paddingLeft: "1rem", paddingRight: "1rem", fontSize: "1rem" }}
            className={`flex items-center gap-3 py-4 rounded-md text-base transition-colors ${
                isActive(item.href)
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.title}
            </Link>
          ))}
        </nav>

        {player && (
          <div className="px-6 py-4 border-t border-neutral-700 text-xs text-neutral-500">
            {player.player_name}
          </div>
        )}
      </aside>
    </>
  )
}
