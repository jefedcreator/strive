'use client';

import React from 'react';
import { Button } from '@/primitives/Button';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import { useSession } from 'next-auth/react';
import { type ApiResponse } from '@/types';
import { type UserReward } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';

interface ClaimBadgeButtonProps {
  clubId: string;
  rewardId: string;
  label?: string;
}

export const ClaimBadgeButton: React.FC<ClaimBadgeButtonProps> = ({
  clubId,
  rewardId,
  label = 'Claim Badge',
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<UserReward>>(
        `/rewards/${rewardId}/claim`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );

      if (data.status !== 200) {
        throw new Error(data.message || 'Failed to claim badge');
      }

      return data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Badge claimed successfully!');
      router.refresh();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while claiming badge';
      toast.error(message);
    },
  });

  const handleClaim = () => {
    if (!session?.user?.token) {
      router.push(
        `/login?rewardId=${rewardId}&callbackUrl=/clubs/${clubId}/rewards/${rewardId}`
      );
      return;
    }
    claimMutation.mutate();
  };

  return (
    <Button
      onClick={handleClaim}
      disabled={claimMutation.isPending}
      className="w-full flex items-center justify-center gap-2 py-6 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
    >
      <ShieldCheck
        className={`w-6 h-6 ${claimMutation.isPending ? 'animate-pulse' : ''}`}
      />
      {claimMutation.isPending ? 'Claiming...' : label}
    </Button>
  );
};
