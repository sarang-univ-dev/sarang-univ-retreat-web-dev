"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Import your skeleton component here
import {
  CalendarDays,
  MapPin,
  Book,
  Mic2,
  StickyNote,
  Users,
  Hash,
  User,
  UserRoundCheck,
  Phone,
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Bed,
  Star
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Skeleton Loading Component for Retreat Card
function RetreatCardSkeleton() {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          <Skeleton className="w-1/2 h-8 mx-auto bg-gray-300 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-gray-300" />
          <Skeleton className="w-3/4 h-5 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-300" />
          <Skeleton className="w-3/4 h-5 bg-gray-300 rounded" />
        </div>
        <div className="flex items-start gap-3">
          <Book className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
          <Skeleton className="w-3/4 h-5 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Mic2 className="w-5 h-5 text-gray-300" />
          <Skeleton className="w-3/4 h-5 bg-gray-300 rounded" />
        </div>
        <div className="flex items-start gap-3 mt-4 pt-4 border-t">
          <StickyNote className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
          <Skeleton className="w-full h-5 bg-gray-300 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loading Component for Retreat Registration Form
function RetreatRegistrationFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* <Skeleton className="w-full h-12 bg-gray-300 rounded" /> */}

      {/* Basic Info Section Skeleton */}
      <div className="grid grid-cols-1 gap-4 pt-4 border-t">
        <div className="space-y-4">
          <Skeleton className="w-1/3 h-5 bg-gray-300 rounded" />
          {[Users, Hash, Star, User, UserRoundCheck, Phone].map(
            (Icon, index) => (
              <div key={index} className="space-y-2">
                <label className="flex items-center gap-2">
                  <Icon className="text-gray-300" />
                  <Skeleton className="w-1/3 h-5 bg-gray-300 rounded" />
                </label>
                <Skeleton className="w-full h-10 bg-gray-300 rounded" />
              </div>
            )
          )}
        </div>
      </div>

      {/* Schedule Selection Skeleton */}
      <div className="pt-4 border-t">
        <Skeleton className="w-1/2 h-8 bg-gray-300 rounded mb-4" />
        <Skeleton className="w-full h-5 bg-gray-300 rounded" />
        <div className="overflow-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                {[Calendar, Sunrise, Sun, Sunset, Bed].map((Icon, index) => (
                  <th key={index} className="p-2">
                    <Icon className="w-5 h-5 text-gray-300" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {[...Array(5)].map((_, colIdx) => (
                    <td key={colIdx} className="p-2 text-center">
                      <Skeleton className="w-5 h-5 bg-gray-300 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Skeleton className="w-full h-10 bg-gray-300 rounded mt-6" />
      </div>
    </div>
  );
}

// Main Component
export function RetreatRegistrationComponentSkeleton() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 3000); // Simulates loading time
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <RetreatCardSkeleton />
        <RetreatRegistrationFormSkeleton />
      </div>
    );
  }

  return <div>{/* Original Component Code */}</div>;
}

export default RetreatRegistrationComponentSkeleton;
