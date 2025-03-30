import type { Event, FirestoreQueryResponse } from "./types"
import { format } from "date-fns"

// Firestore endpoints
const ENDPOINTS = {
  circle: "https://firestore.googleapis.com/v1/projects/circle-calendar-kaihatu/databases/(default)/documents/event",
  jobHunting: "https://firestore.googleapis.com/v1/projects/jobhuntingevents/databases/(default)/documents/event",
  university: "https://firestore.googleapis.com/v1/projects/universityevents-c12a1/databases/(default)/documents/event",
}

// Query Firestore for events in a specific date range
export async function fetchEvents(startDate: Date, endDate: Date): Promise<Event[]> {
  const startDateStr = format(startDate, "yyyy-MM-dd'T'00:00:00'Z'")
  const endDateStr = format(endDate, "yyyy-MM-dd'T'23:59:59'Z'")

  // Create query for each category
  const queries = Object.entries(ENDPOINTS).map(async ([category, endpoint]) => {
    const query = {
      structuredQuery: {
        from: [{ collectionId: "event" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "date" },
                  op: "GREATER_THAN_OR_EQUAL",
                  value: { timestampValue: startDateStr },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "date" },
                  op: "LESS_THAN_OR_EQUAL",
                  value: { timestampValue: endDateStr },
                },
              },
            ],
          },
        },
        orderBy: [{ field: { fieldPath: "date" }, direction: "ASCENDING" }],
      },
    }

    try {
      // Use the :runQuery endpoint
      const response = await fetch(`${endpoint.split("/documents")[0]}/documents:runQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      })

      if (!response.ok) {
        throw new Error(`Error fetching ${category} events: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform Firestore response to Event objects
      return data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((item: any) => item.document) // Filter out empty results
        .map((item: FirestoreQueryResponse) => {
          const fields = item.document.fields

          return {
            id: item.document.name.split("/").pop(),
            title: fields.title?.stringValue || "Untitled",
            date: fields.date?.timestampValue || new Date().toISOString(),
            description: fields.description?.stringValue || "",
            location: fields.location?.stringValue || "",
            company: fields.company?.stringValue || "",
            type: fields.type?.stringValue || "",
            url: fields.url?.stringValue || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            category: category as any,
            priority: fields.priority?.integerValue
              ? Number.parseInt(fields.priority.integerValue)
              : fields.priority?.doubleValue || 0,
          }
        })
    } catch (error) {
      console.error(`Error fetching ${category} events:`, error)
      return []
    }
  })

  // Wait for all queries to complete
  const results = await Promise.all(queries)

  // Flatten the array of arrays into a single array of events
  return results.flat()
}

