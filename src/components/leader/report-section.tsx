"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLeaderDraftStore } from "@/store/leader-draft-store";

interface ReportSectionProps {
  /** 마지막 날이면 보고 입력을 숨긴다(서버도 마지막 날 POST 거부). */
  isLastDay: boolean;
}

export function ReportSection({ isLastDay }: ReportSectionProps) {
  const graceSharing = useLeaderDraftStore((s) => s.draft.graceSharing);
  const prayerRequests = useLeaderDraftStore((s) => s.draft.prayerRequests);
  const setGraceSharing = useLeaderDraftStore((s) => s.setGraceSharing);
  const setPrayerRequests = useLeaderDraftStore((s) => s.setPrayerRequests);

  if (isLastDay) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">GBS 보고</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            마지막 날에는 보고를 작성하지 않습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">GBS 보고</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="grace-sharing">은혜 나눔</Label>
          <Textarea
            id="grace-sharing"
            value={graceSharing}
            onChange={(e) => setGraceSharing(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prayer-topics">기도 제목</Label>
          <Textarea
            id="prayer-topics"
            value={prayerRequests}
            onChange={(e) => setPrayerRequests(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
