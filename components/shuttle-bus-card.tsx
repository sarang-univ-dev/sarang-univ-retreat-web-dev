"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Book, Mic2, StickyNote } from "lucide-react";

interface ShuttleBusCardProps {
  name: string;
  dates: string;
  location: string;
  main_verse: string;
  main_speaker: string;
  memo?: string | null;
  poster_url?: string | null;
}

function ShuttleBusCard({
  name,
  dates,
  location,
  main_verse,
  main_speaker,
  memo,
  poster_url
}: ShuttleBusCardProps) {
  return (
    <Card className="w-full mx-auto overflow-hidden">
      <div className="relative">
        {poster_url && (
          <div className="relative w-full h-[500px] md:h-[600px]">
            <Image
              src={poster_url || "/placeholder.svg"}
              alt={`${name} 포스터`}
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60"></div>
          </div>
        )}

        <div
          className={`${
            poster_url ? "absolute inset-0 z-10" : ""
          } p-3 sm:p-4 md:p-6 flex flex-col h-full`}
        >
          <CardHeader className="flex-grow flex flex-col items-center justify-center">
            <CardTitle className="text-3xl md:text-4xl font-bold text-center mb-4">
              {name}
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 bg-white/80 rounded-lg p-2 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-medium">{dates}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-medium">{location}</span>
            </div>
            <div className="flex items-start gap-3">
              <Book className="w-5 h-5 text-primary shrink-0 mt-1" />
              <p className="text-sm italic break-keep break-words">
                {main_verse}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Mic2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-medium">{main_speaker}</span>
            </div>
            {memo && (
              <div className="flex items-start gap-3 mt-4 pt-4 border-t">
                <StickyNote className="w-5 h-5 text-primary shrink-0 mt-1" />
                <p className="text-sm">{memo}</p>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export default ShuttleBusCard;
