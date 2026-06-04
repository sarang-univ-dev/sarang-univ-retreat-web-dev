import { Card, CardContent } from "@/components/ui/card";
import { useShuttleBusTotalPrice } from "@/hooks/use-shuttle-bus-derived";

export function ShuttleBusTotalCard() {
  const totalPrice = useShuttleBusTotalPrice();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">총 금액:</span>
          <span className="text-lg font-bold">
            {totalPrice.toLocaleString()}원
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
