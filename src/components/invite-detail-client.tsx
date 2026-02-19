'use client';

import { type ApiResponse, type ClubInviteDetail, type LeaderboardInviteDetail } from '@/types';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Button } from '@/primitives/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/primitives/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const InviteDetailClient = ({
  initialData,
  type,
}: {
  initialData: ApiResponse<ClubInviteDetail | LeaderboardInviteDetail | null>;
  type: 'club' | 'leaderboard';
}) => {
  const router = useRouter(); 
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const invite = initialData?.data;

  if (!invite) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-10 text-center bg-card/50 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl max-w-md w-full mx-auto"
      >
        <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 ring-8 ring-red-500/5">
          <X className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-3 tracking-tight">
          Invite Unavailable
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mb-10 leading-relaxed">
          This invite link may have expired, or you might not have the correct
          permissions to view it.
        </p>
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="rounded-full px-8"
        >
          Return Home
        </Button>
      </motion.div>
    );
  }

  const isClub = type === 'club';
  
  // Extract entity based on type
  const entityName = isClub ? (invite as ClubInviteDetail).club.name : (invite as LeaderboardInviteDetail).leaderboard.name;
  const entityDescription = isClub ? (invite as ClubInviteDetail).club.description : (invite as LeaderboardInviteDetail).leaderboard.description;
  const entityId = isClub ? (invite as ClubInviteDetail).club.id : (invite as LeaderboardInviteDetail).leaderboard.id;
  const entityMemberCount = isClub ? (invite as ClubInviteDetail).club.memberCount : (invite as LeaderboardInviteDetail).leaderboard._count.entries;
  const inviter = invite.inviter;

  const entityImage = isClub 
    ? ((invite as ClubInviteDetail).club.image || null) 
    : `/api/leaderboards/og?name=${encodeURIComponent(entityName)}`;

  const inviterName = inviter?.fullname ?? inviter?.username ?? 'A member';

  const handleAccept = async () => {
    setIsAccepting(true);
    router.push(type === 'club' ? `/?clubId=${entityId}&inviteId=${invite.id}` : `/?leaderboardId=${entityId}&inviteId=${invite.id}`);
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.info('Invitation declined.', {
      description: 'Maybe next time.',
    });
    router.push('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1.2,
      }}
      className="w-full max-w-[420px] mx-auto relative group perspective"
    >
      {/* Decorative background glow */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-purple-600/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />

      <div className="relative bg-card/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        {/* Top subtle shine effect */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header Section: Inviter Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, ease: 'easeOut' }}
          className="flex items-center space-x-3.5 mb-8 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5"
        >
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
            <AvatarImage src={inviter?.avatar ?? ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {inviterName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
              Invited by
            </p>
            <p className="text-sm font-bold leading-tight">{inviterName}</p>
          </div>
        </motion.div>

        {/* Entity Image / Initial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative w-full h-[220px] rounded-[1.5rem] overflow-hidden mb-8 bg-muted shadow-inner group/image"
        >
          {entityImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entityImage}
              alt={entityName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <ShieldCheck className="w-24 h-24 text-white/10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-3xl font-black tracking-tight leading-none mb-2">
              {entityName}
            </h1>
            {entityMemberCount !== null && (
              <div className="flex items-center text-white/80 text-sm font-semibold tracking-wide">
                <Users size={16} className="mr-2 opacity-80" />
                {entityMemberCount} Athlete{entityMemberCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </motion.div>

        {/* Entity Description */}
        {entityDescription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <p className="text-muted-foreground text-sm leading-relaxed text-center font-medium px-4">
              &quot;{entityDescription}&quot;
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 group/btn transition-all duration-300 relative overflow-hidden"
            onClick={handleAccept}
            disabled={isAccepting || isDeclining}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            {isAccepting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center relative z-10"
              >
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                {isAccepting ? `Joining ${type === 'club' ? 'Club' : 'Team'}...` : 'Accept Invitation'}
              </motion.div>
            ) : (
              <span className="flex items-center relative z-10">
                {`Accept Invitation to ${entityName}`}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full rounded-2xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
          >
            {isDeclining ? 'Declining...' : 'Decline'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InviteDetailClient;
