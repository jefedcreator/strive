'use client';

import { type LeaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { Button, Field, Form, Input, Textarea } from '@/primitives';
import { Calendar } from '@/primitives/Calendar';
import { Modal } from '@/primitives/Modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/primitives/Popover';
import { type ClubListItem } from '@/types';
import * as Switch from '@radix-ui/react-switch';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from 'react-hook-form';

export type { LeaderboardValidatorSchema as LeaderboardFormValues };

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'edit';
  register: UseFormRegister<LeaderboardValidatorSchema>;
  control: Control<LeaderboardValidatorSchema>;
  errors: FieldErrors<LeaderboardValidatorSchema>;
  handleSubmit: UseFormHandleSubmit<LeaderboardValidatorSchema>;
  onSubmit: (data: LeaderboardValidatorSchema) => void;
  isPending: boolean;
  clubs: ClubListItem[];
}

import { Calendar as CalendarIcon, ChevronDown, X, Trophy, Swords } from 'lucide-react';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  type,
  register,
  control,
  errors,
  handleSubmit,
  onSubmit,
  isPending,
  clubs,
}) => {
  const [isChallenge, setIsChallenge] = useState(!control._defaultValues.clubId);

  const ModeIcon = isChallenge ? Swords : Trophy;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Portal>
        <Modal.Content className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-white dark:bg-[#111113] rounded-2xl shadow-2xl z-[101] border border-gray-200 dark:border-[#1E1E22] focus:outline-none overflow-hidden max-h-[90vh] flex flex-col">
          {/* ─── Header ──────────────────────────────────────── */}
          <div className="flex items-start justify-between border-b border-gray-100 dark:border-[#1E1E22] p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isChallenge
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'bg-teal-500/10 text-teal-500'
              }`}>
                <ModeIcon className="w-5 h-5" />
              </div>
              <div>
                <Modal.Title className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {type === 'create'
                    ? `New ${isChallenge ? 'Challenge' : 'Leaderboard'}`
                    : `Edit ${isChallenge ? 'Challenge' : 'Leaderboard'}`}
                </Modal.Title>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-[#71717A]">
                  {type === 'create' ? 'Set up' : 'Update'} the details for your{' '}
                  {isChallenge ? 'challenge' : 'leaderboard'}.
                </p>
              </div>
            </div>
            <Modal.Close className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1E] hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </Modal.Close>
          </div>

          {/* ─── Form ────────────────────────────────────────── */}
          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-y-auto p-6 space-y-5 flex-1"
          >
            {/* Name & Club */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field id="name" label="Name" error={errors.name?.message}>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder={`e.g. Summer Sprint ${isChallenge ? 'Challenge' : 'Leaderboard'}`}
                />
              </Field>

              <Field
                id="clubId"
                label="Club"
                error={errors.clubId?.message}
                description="Leave empty for a standalone Challenge."
              >
                <div className="relative">
                  <select
                    {...register('clubId', {
                      onChange: (e) => setIsChallenge(e.target.value === ''),
                    })}
                    id="clubId"
                    className="h-11 w-full appearance-none rounded-xl border border-gray-200 dark:border-[#2A2A2E] bg-white dark:bg-[#18181B] px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="">No Club (Challenge)</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </Field>
            </div>

            {/* Description */}
            <Field
              id="description"
              label="Description"
              error={errors.description?.message}
            >
              <Textarea
                {...register('description')}
                id="description"
                placeholder={`Describe the rules and goals of this ${isChallenge ? 'challenge' : 'leaderboard'}…`}
              />
            </Field>

            {/* Expiration Date */}
            <Field
              id="expiryDate"
              label="Expiration Date"
              error={errors.expiryDate?.message}
            >
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`h-11 w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-[#2A2A2E] bg-white dark:bg-[#18181B] px-4 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
                          field.value
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-[#52525B]'
                        }`}
                      >
                        {field.value
                          ? format(new Date(field.value), 'PPP')
                          : 'Pick an expiration date'}
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => field.onChange(date ?? undefined)}
                        className="rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </Field>

            {/* Visibility */}
            <div className="rounded-xl border border-gray-200 dark:border-[#2A2A2E] bg-gray-50 dark:bg-[#18181B] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  Visibility
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#71717A]">
                  Public {isChallenge ? 'challenges' : 'leaderboards'} are visible to everyone.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Private
                </span>
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field }) => (
                    <Switch.Root
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-11 h-6 bg-gray-200 dark:bg-[#2A2A2E] rounded-full relative data-[state=checked]:bg-primary outline-none cursor-pointer transition-colors"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 shadow-sm will-change-transform data-[state=checked]:translate-x-6" />
                    </Switch.Root>
                  )}
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Public
                </span>
              </div>
            </div>
          </Form>

          {/* ─── Footer ──────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-[#1E1E22] p-6 bg-gray-50 dark:bg-[#0E0E10]">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {type === 'create'
                ? isChallenge
                  ? 'Create Challenge'
                  : 'Create Leaderboard'
                : 'Save Changes'}
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
};
