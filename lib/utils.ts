import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Event } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addToGoogleCalendar(event: Event) {
  const eventDate = new Date(event.date)

  // Create end time (default to 1 hour after start time)
  const endDate = new Date(eventDate)
  endDate.setHours(endDate.getHours() + 1)

  // Format dates for Google Calendar
  const startTime = eventDate.toISOString().replace(/-|:|\.\d+/g, "")
  const endTime = endDate.toISOString().replace(/-|:|\.\d+/g, "")

  // Build Google Calendar URL
  const url = new URL("https://www.google.com/calendar/render")
  url.searchParams.append("action", "TEMPLATE")
  url.searchParams.append("text", event.title)

  if (event.description) {
    url.searchParams.append("details", event.description)
  }

  if (event.location) {
    url.searchParams.append("location", event.location)
  }

  url.searchParams.append("dates", `${startTime}/${endTime}`)

  // Open in new tab
  window.open(url.toString(), "_blank")
}

