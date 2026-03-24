"use client"

import React, { useState } from "react"

interface TabData {
  value: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface CustomTabsProps {
  defaultValue: string
  tabs: TabData[]
}

export default function CustomTabs({ defaultValue, tabs }: CustomTabsProps) {
  const [active, setActive] = useState(defaultValue)

  return (
    <div>
      <div className="flex border-b border-neutral-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active === tab.value
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-neutral-400 hover:text-neutral-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.value} className={active === tab.value ? "" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
