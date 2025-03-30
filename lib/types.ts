export type EventCategory = "circle" | "jobHunting" | "university" | "personal"

export interface Event {
  id: string
  title: string
  date: string
  description?: string
  location?: string
  company?: string
  type?: string
  category: EventCategory
  priority?: number
  url?: string
}

export interface FirestoreResponse {
  documents: {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>
    createTime: string
    updateTime: string
  }[]
}

export interface FirestoreQueryResponse {
  document: {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, any>
    createTime: string
    updateTime: string
  }
}

export interface FirestoreField {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  timestampValue?: string
}

