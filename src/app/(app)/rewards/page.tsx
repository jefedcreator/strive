import Background from '@/components/background';
import { RewardsPageClient } from '@/components/rewards-page-client';

export const metadata = {
  title: 'My Rewards | Strive',
  description: 'View and share your earned rewards and badges.',
};

export default function RewardsPage() {
  return (
    <div className="relative">
      <Background />
      <RewardsPageClient />
    </div>
  );
}
