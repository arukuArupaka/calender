"use client"

import type { EventCategory } from "@/lib/types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabsProps {
  activeTab: EventCategory | "all"
  onTabChange: (tab: EventCategory | "all") => void
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { id: "all", label: "すべて" },
    { id: "circle", label: "サークル" },
    { id: "jobHunting", label: "就活" },
    { id: "university", label: "大学情報" },
  ]

  return (
    <div className="relative flex w-full border-b">
      <div className="flex w-full overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as EventCategory | "all")}
            className={cn(
              "flex-1 px-1 py-2 text-sm font-medium relative whitespace-nowrap",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

