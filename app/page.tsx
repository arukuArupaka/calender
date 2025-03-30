"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import Calendar from "@/components/calendar"
import Tabs from "@/components/tabs"
import EventForm from "@/components/event-form"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchEvents } from "@/lib/api"
import type { Event, EventCategory } from "@/lib/types"
import TypeFilter from "@/components/type-filter"
import { AnimatePresence, motion } from "framer-motion"

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<EventCategory | "all">("all")
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [availableTypes, setAvailableTypes] = useState<Record<EventCategory | "all", string[]>>({
    all: [],
    circle: [],
    jobHunting: [],
    university: [],
  })

  // Fetch events when month changes
  useEffect(() => {
    const fetchAllEvents = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)

        // Fetch events from all sources
        const allEvents = await fetchEvents(start, end)

        // Get user events from localStorage
        const userEventsJson = localStorage.getItem("userEvents")
        const userEvents: Event[] = userEventsJson ? JSON.parse(userEventsJson) : []

        // Filter user events for current month
        const filteredUserEvents = userEvents.filter((event) => {
          const eventDate = new Date(event.date)
          return eventDate >= start && eventDate <= end
        })

        // Combine all events
        const combinedEvents = [...allEvents, ...filteredUserEvents]

        setEvents(combinedEvents)

        // Extract available types for each category
        const types: Record<EventCategory | "all", Set<string>> = {
          all: new Set(),
          circle: new Set(),
          jobHunting: new Set(),
          university: new Set(),
        }

        combinedEvents.forEach((event) => {
          if (event.type) {
            types[event.category].add(event.type)
            types.all.add(event.type)
          }
        })

        // Convert Sets to arrays
        setAvailableTypes({
          all: Array.from(types.all),
          circle: Array.from(types.circle),
          jobHunting: Array.from(types.jobHunting),
          university: Array.from(types.university),
        })
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllEvents()
  }, [currentDate])

  // Filter events when tab or selected types change
  useEffect(() => {
    let filtered = [...events]

    // Filter by category, but always include personal events
    if (activeTab !== "all") {
      filtered = filtered.filter((event) => event.category === activeTab || event.category === "personal")
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((event) => event.type && selectedTypes.includes(event.type))
    }

    setFilteredEvents(filtered)
  }, [events, activeTab, selectedTypes])

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1))
  }

  const handleAddEvent = (newEvent: Event) => {
    // Get existing user events
    const userEventsJson = localStorage.getItem("userEvents")
    const userEvents: Event[] = userEventsJson ? JSON.parse(userEventsJson) : []

    // Add new event
    const updatedEvents = [...userEvents, newEvent]

    // Save to localStorage
    localStorage.setItem("userEvents", JSON.stringify(updatedEvents))

    // Update state if the event is in the current month
    const eventDate = new Date(newEvent.date)
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)

    if (eventDate >= start && eventDate <= end) {
      setEvents((prevEvents) => [...prevEvents, newEvent])
    }

    setShowEventForm(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md mx-auto px-0 sm:px-4 pb-20">
        <header className="sticky top-0 bg-background z-10 pt-4 pb-2">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex justify-between items-center mt-4 mb-2 px-4">
            <Button variant="ghost" onClick={handlePrevMonth}>
              &lt;
            </Button>
            <h2 className="text-xl font-bold">{format(currentDate, "yyyy年M月", { locale: ja })}</h2>
            <Button variant="ghost" onClick={handleNextMonth}>
              &gt;
            </Button>
          </div>

          <TypeFilter
            types={availableTypes[activeTab]}
            selectedTypes={selectedTypes}
            onTypeSelect={(type) => {
              setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
            }}
          />
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64 w-full"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Calendar currentDate={currentDate} events={filteredEvents} />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowEventForm(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>

        <AnimatePresence>
          {showEventForm && <EventForm onSubmit={handleAddEvent} onCancel={() => setShowEventForm(false)} />}
        </AnimatePresence>
      </div>
    </main>
  )
}

