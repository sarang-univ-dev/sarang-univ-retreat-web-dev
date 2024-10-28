"use client";

import { CalendarDays, MapPin, Book, Mic2, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RetreatCardProps {
  name: string;
  dates: string;
  location: string;
  main_verse: string;
  main_speaker: string;
  memo?: string;
}

function RetreatCard({
  name,
  dates,
  location,
  main_verse,
  main_speaker,
  memo,
}: RetreatCardProps) {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{name}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span>{dates}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary" />
          <span>{location}</span>
        </div>
        <div className="flex items-start gap-3">
          <Book className="w-5 h-5 text-primary shrink-0 mt-1" />
          <p className="text-sm italic">{main_verse}</p>
        </div>
        <div className="flex items-center gap-3">
          <Mic2 className="w-5 h-5 text-primary" />
          <span>{main_speaker}</span>
        </div>
        {memo && (
          <div className="flex items-start gap-3 mt-4 pt-4 border-t">
            <StickyNote className="w-5 h-5 text-primary shrink-0 mt-1" />
            <p className="text-sm">{memo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RetreatCard;
