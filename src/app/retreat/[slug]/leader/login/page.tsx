"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSlug } from "@/hooks/use-slug";
import {
  leaderQueryKeys,
  useLeaderLogin,
  useLeaderMe,
} from "@/hooks/use-leader-queries";
import { requiredPhoneSchema } from "@/schemas/registration";
import { formatPhone } from "@/lib/phone-format";
import { getErrorMessage, logError } from "@/lib/error-handler";

const loginSchema = z.object({
  phone: requiredPhoneSchema,
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LeaderLoginPage() {
  const slug = useSlug();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 이미 로그인된 상태면 대시보드로
  const meQuery = useLeaderMe(slug);
  useEffect(() => {
    if (meQuery.data?.leader) {
      router.replace(`/retreat/${slug}/leader/dashboard`);
    }
  }, [meQuery.data, router, slug]);

  const login = useLeaderLogin(slug);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { phone: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values.phone, {
      onSuccess: async () => {
        // 로그인 성공 → /me 캐시 무효화 후 대시보드로
        await queryClient.invalidateQueries({
          queryKey: leaderQueryKeys.me(slug),
        });
        router.replace(`/retreat/${slug}/leader/dashboard`);
      },
      onError: (error) => {
        logError(error, "leader-login");
        // 서버 메시지(401 미등록 / 409 다중계정)를 그대로 노출
        setError("phone", { message: getErrorMessage(error) });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">GBS 리더 로그인</CardTitle>
          <CardDescription>
            등록 시 사용한 전화번호로 로그인해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="010-1234-5678"
                    value={field.value}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={login.isPending}
            >
              <span>로그인</span>
              {login.isPending && (
                <svg
                  className="ml-2 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
