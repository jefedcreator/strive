'use client';

import type { ClubInviteValidatorSchema } from '@/backend/validators/club.validator';
import { useDebounce } from '@/hooks/useDebounce';
import { Field } from '@/primitives';
import { Input } from '@/primitives/Input';
import { Modal } from '@/primitives/Modal';
import api from '@/utils/axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Loader2, Search, UserPlus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Social share icon SVGs (inline, no extra dep)                       */
/* ------------------------------------------------------------------ */

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.528 5.837L.057 23.882l6.233-1.635A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.847 0-3.575-.485-5.076-1.334l-.363-.217-3.764.988.988-3.648-.241-.38A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The id of the entity to invite to */
  entityId?: string;
  /** Display name of the club / leaderboard */
  name: string;
  /** The invite URL to share */
  inviteUrl: string;
  /** Optional cover image */
  image?: string | null;
  /** Whether the entity is public */
  isPublic?: boolean;
  /** Icon variant — 'club' shows Users, 'leaderboard' shows Trophy */
  variant?: 'club' | 'leaderboard';
  /** Slug/subtitle shown under the copy field (optional) */
  subtitle?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onOpenChange,
  entityId,
  name,
  inviteUrl,
  image,
  isPublic = true,
  variant = 'club',
  subtitle,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { data: session } = useSession();
  const [debouncedEmail, setDebouncedEmail] = React.useState('');

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<{ email: string }>({
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const emailRegister = register('email', {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  });

  const debouncedSetEmail = useDebounce(setDebouncedEmail, 600);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void emailRegister.onChange(e);
    debouncedSetEmail(e.target.value);
  };

  React.useEffect(() => {
    if (!open) {
      setDebouncedEmail('');
      reset({ email: '' });
    }
  }, [open, reset]);

  const { data: foundUser, isFetching: isSearching } = useQuery({
    queryKey: ['userSearch', debouncedEmail],
    queryFn: async () => {
      const res = await api.get(
        `/users/search?email=${encodeURIComponent(debouncedEmail)}`,
        { headers: { Authorization: `Bearer ${session?.user?.token}` } }
      );
      return res.data?.data;
    },
    enabled:
      !!debouncedEmail &&
      debouncedEmail.length >= 3 &&
      debouncedEmail.includes('@') &&
      !!session?.user?.token,
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!foundUser || !entityId) throw new Error('Missing data');
      const body: ClubInviteValidatorSchema = {
        userId: foundUser.id,
        isExternal: foundUser.isExternal,
      };
      if (foundUser.isExternal) {
        body.email = debouncedEmail;
        delete body.userId;
      }
      return api.post(
        `/${variant}s/${entityId}/invites`,
        body,
        { headers: { Authorization: `Bearer ${session?.user?.token}` } }
      );
    },
    onSuccess: () => {
      toast.success(`Invite sent to ${foundUser?.fullname}!`);
      setDebouncedEmail('');
      reset({ email: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invite');
    },
  });

  const handleInviteUser = () => inviteMutation.mutate();
  const isInviting = inviteMutation.isPending;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  const shareText = encodeURIComponent(`Join ${name} on Strive! ${inviteUrl}`);

  const socialLinks = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${shareText}`,
      icon: <WhatsAppIcon />,
      color: 'hover:text-green-500 hover:border-green-500/30',
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${shareText}`,
      icon: <XIcon />,
      color:
        'hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}`,
      icon: <FacebookIcon />,
      color: 'hover:text-blue-600 hover:border-blue-500/30',
    },
  ];

  /* pretty-print the URL without the protocol */
  const displayUrl = inviteUrl.replace(/^https?:\/\//, '');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]" />

        <Modal.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[90vw] max-w-[420px] z-[100]
                     bg-white dark:bg-[#111111]
                     rounded-2xl overflow-hidden
                     border border-black/8 dark:border-white/[0.08]
                     shadow-2xl shadow-black/20"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                key="share-modal"
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 pt-5 pb-0">
                  <Modal.Title className="text-[15px] font-semibold text-gray-900 dark:text-white">
                    Share {variant === 'club' ? 'club' : 'leaderboard'}
                  </Modal.Title>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full
                               text-gray-400 hover:text-gray-900 dark:hover:text-white
                               hover:bg-gray-100 dark:hover:bg-white/10
                               transition-colors outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── Cover + name ── */}
                <div className="flex flex-col items-center px-5 pt-5 pb-4 gap-3">
                  {/* Cover thumbnail */}
                  <div className="w-[140px] h-[100px] rounded-[12px] overflow-hidden border border-black/6 dark:border-white/8 shadow-sm">
                    <Image
                      src={
                        image ??
                        `/api/og?name=${encodeURIComponent(name)}&type=${variant}`
                      }
                      alt={name}
                      width={140}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <p className="font-semibold text-[15px] text-gray-900 dark:text-white leading-tight">
                      {name}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Click the link below to copy 👇
                    </p>
                  </div>

                  {/* Copy link pill */}
                  <button
                    onClick={handleCopy}
                    className="group w-full flex items-center justify-between
                               bg-gray-50 dark:bg-white/[0.06]
                               border border-gray-200 dark:border-white/[0.08]
                               hover:border-primary/40 dark:hover:border-primary/40
                               rounded-full px-4 py-2.5
                               transition-all duration-200 outline-none"
                  >
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate pr-2 text-left">
                      {displayUrl}
                    </span>
                    <span className="shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                </div>

                {/* ── Invite by Email ── */}
                <div className="px-5 pb-4">
                  <Field
                    id="email"
                    label="Email Address"
                    className="hidden"
                    formClassName="!gap-0"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        {...emailRegister}
                        onChange={handleEmailChange}
                        id="email"
                        type="email"
                        placeholder="Invite by email address..."
                        className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-primary/50 dark:focus:border-primary/50 text-[13px] rounded-lg pl-9 pr-10 py-2.5 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                      )}
                    </div>
                  </Field>
                  <AnimatePresence>
                    {foundUser && !isSearching && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between mt-3 p-2 rounded-lg border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                              {foundUser.avatar ? (
                                <Image
                                  src={foundUser.avatar}
                                  alt={foundUser.fullname}
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase">
                                  {foundUser.fullname.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                                {foundUser.fullname}
                              </span>
                              {foundUser.username && (
                                <span className="text-[11px] text-gray-500">
                                  @{foundUser.username}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={handleInviteUser}
                            disabled={isInviting}
                            className="bg-primary text-white text-[12px] font-semibold px-3 py-1.5 rounded-md hover:bg-opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
                          >
                            {isInviting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserPlus className="w-3 h-3" />
                            )}
                            Invite
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Divider ── */}
                <div className="relative flex items-center px-5 py-1">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.07]" />
                  <span className="px-3 text-[11px] text-gray-400 dark:text-gray-600 font-medium">
                    or share to
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.07]" />
                </div>

                {/* ── Social buttons ── */}
                <div className="flex items-center justify-center gap-4 px-5 py-4">
                  {socialLinks.map(({ label, href, icon, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Share on ${label}`}
                      className={`w-11 h-11 flex items-center justify-center rounded-full
                                  border border-gray-200 dark:border-white/[0.10]
                                  text-gray-400 dark:text-gray-500
                                  transition-all duration-200 hover:scale-105
                                  ${color}`}
                    >
                      {icon}
                    </a>
                  ))}
                </div>

                {/* ── Footer tip ── */}
                <div className="px-5 py-3.5 bg-gray-50 dark:bg-white/[0.03] border-t border-gray-100 dark:border-white/[0.06]">
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center leading-relaxed">
                    ⓘ{' '}
                    {isPublic
                      ? 'Anyone with this link can join the ' +
                        (variant === 'club' ? 'club' : 'leaderboard') +
                        '.'
                      : 'This is a private ' +
                        (variant === 'club' ? 'club' : 'leaderboard') +
                        '. Only invited users can join.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
};
