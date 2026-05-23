"use client";

import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  Book,
  Mic2,
  UserRound
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RetreatCardProps {
  name: string;
  year: number;
  dates: string;
  location: string;
  main_verse: string;
  main_speaker?: string;
  poster_url?: string;
  retreat_registration_name?: string;
  form_kind?: string;
}

function RetreatCard({
  name,
  year,
  dates,
  location,
  main_verse,
  main_speaker,
  poster_url,
  retreat_registration_name,
  form_kind
}: RetreatCardProps) {
  return (
    <Card className="w-full mx-auto overflow-hidden">
      <div className="flex flex-col">
        {poster_url && (
          <div className="relative w-full">
            <Image
              src={poster_url}
              alt={`${name} 포스터`}
              width={1200}
              height={1600}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        <div className="p-3 sm:p-4 md:p-6">
          <CardContent className="grid gap-4 bg-white/80 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
            <div className="text-center text-xl md:text-2xl font-semibold mb-2">
              {year} 대학부 여름연합수양회 {name} {form_kind ? `${form_kind} ` : ""}신청폼
            </div>
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
              <p className="text-sm italic break-keep break-words">{main_verse}</p>
            </div>
            {main_speaker && (
              <div className="flex items-center gap-3">
                <Mic2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{main_speaker}</span>
              </div>
            )}
            {retreat_registration_name && (
              <div className="flex items-center gap-3">
                <UserRound className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">
                  지금은 {retreat_registration_name} 기간입니다.
                </span>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

export default RetreatCard;
