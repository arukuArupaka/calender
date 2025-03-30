"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TypeFilterProps {
  types: string[]
  selectedTypes: string[]
  onTypeSelect: (type: string) => void
}

export default function TypeFilter({ types, selectedTypes, onTypeSelect }: TypeFilterProps) {
  if (types.length === 0) return null

  return (
    <ScrollArea className="w-full whitespace-nowrap px-4 py-2">
      <div className="flex gap-2">
        {types.map((type) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Badge
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onTypeSelect(type)}
            >
              {type}
            </Badge>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  )
}

