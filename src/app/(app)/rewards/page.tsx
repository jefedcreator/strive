import Background from '@/components/background';
import { RewardsPageClient } from '@/components/rewards-page-client';
import { getRewards } from '@/server';
import type { PageProps } from '@/types';
import { loadBaseParams } from '@/utils';

export const metadata = {
  title: 'My Rewards | Strive',
  description: 'View and share your earned rewards and badges.',
};

export default async function RewardsPage({ searchParams }: PageProps) {
  const { page } = loadBaseParams.parse(await searchParams);

  const initialData = await getRewards({
    page,
  });

  return (
    <div className="relative">
      <Background />
      <RewardsPageClient
        currentFilters={{ page }}
        initialData={initialData}
      />
    </div>
  );
}
