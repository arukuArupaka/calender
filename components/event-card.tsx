"use client";

import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, Building, X } from "lucide-react";
import { addToGoogleCalendar } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  onClose: () => void;
}

export default function EventCard({ event, onClose }: EventCardProps) {
  const eventDate = new Date(event.date);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "circle":
        return "サークル";
      case "jobHunting":
        return "就活";
      case "university":
        return "大学情報";
      case "personal":
        return "個人予定";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "circle":
        return "bg-blue-100 text-blue-800";
      case "jobHunting":
        return "bg-green-100 text-green-800";
      case "university":
        return "bg-purple-100 text-purple-800";
      case "personal":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{event.title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(eventDate, "yyyy年M月d日(E) HH:mm", { locale: ja })}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        )}

        {event.company && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{event.company}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(event.category)}>
            {getCategoryLabel(event.category)}
          </Badge>

          {event.type && <Badge variant="outline">{event.type}</Badge>}
        </div>

        {event.description && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>{event.description}</p>
          </div>
        )}

        {event.url && (
          <div className="flex justify-center items-center mt-2">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              イベント詳細を見る
            </a>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => addToGoogleCalendar(event)}>
            Googleカレンダーに追加
          </Button>
        </div>
      </div>
    </div>
  );
}
