"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  getDay,
  addDays,
} from "date-fns";
import type { Event } from "@/lib/types";
import EventCard from "./event-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalendarProps {
  currentDate: Date;
  events: Event[];
}

export default function Calendar({ currentDate, events }: CalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get days in month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get start day of week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);

  // Create array for calendar grid (including padding days)
  const calendarDays = [];

  // Add padding days before the first day of the month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(addDays(monthStart, i - startDay));
  }

  // Add all days in the month
  calendarDays.push(...daysInMonth);

  // Group events by date
  const eventsByDate: Record<string, Event[]> = {};

  events.forEach((event) => {
    const dateKey = format(new Date(event.date), "yyyy-MM-dd");
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  // Sort events by priority (descending)
  Object.keys(eventsByDate).forEach((dateKey) => {
    eventsByDate[dateKey].sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA;
    });
  });

  // Days of week headers
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="w-full overflow-hidden">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center mb-1">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-sm font-medium py-1",
              index === 0 ? "text-red-500" : "",
              index === 6 ? "text-blue-500" : ""
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {calendarDays.map((day, i) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={i}
              className={cn(
                "bg-white min-h-[100px] p-1",
                !isCurrentMonth && "opacity-40"
              )}
            >
              <div
                className={cn(
                  "text-xs font-medium mb-1",
                  getDay(day) === 0 ? "text-red-500" : "",
                  getDay(day) === 6 ? "text-blue-500" : ""
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <motion.div
                    key={`${event.id}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedEvent(event)}
                    className={cn(
                      "text-xs rounded truncate cursor-pointer",
                      event.category === "circle" &&
                        "bg-blue-100 text-blue-800",
                      event.category === "jobHunting" &&
                        "bg-green-100 text-green-800",
                      event.category === "university" &&
                        "bg-purple-100 text-purple-800",
                      event.category === "personal" &&
                        "bg-yellow-100 text-yellow-800"
                    )}
                  >
                    {event.title}
                  </motion.div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 font-medium">
                    +{dayEvents.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <EventCard
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
