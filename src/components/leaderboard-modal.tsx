'use client';

import { type LeaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { Form, Field, Input, Textarea, Button } from '@/primitives';
import { Calendar } from '@/primitives/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/primitives/Popover';
import { Modal } from '@/primitives/Modal';
import { type ClubListItem } from '@/types';
import * as Switch from '@radix-ui/react-switch';
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormHandleSubmit,
} from 'react-hook-form';

export type { LeaderboardValidatorSchema as LeaderboardFormValues };

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'edit';
  /** react-hook-form register */
  register: UseFormRegister<LeaderboardValidatorSchema>;
  /** react-hook-form control (for Controller fields) */
  control: Control<LeaderboardValidatorSchema>;
  /** react-hook-form errors */
  errors: FieldErrors<LeaderboardValidatorSchema>;
  /** react-hook-form handleSubmit */
  handleSubmit: UseFormHandleSubmit<LeaderboardValidatorSchema>;
  /** Called with validated form data */
  onSubmit: (data: LeaderboardValidatorSchema) => void;
  /** Whether the mutation is currently in progress */
  isPending: boolean;
  /** List of clubs for the dropdown */
  clubs: ClubListItem[];
  /** Called when user selects a thumbnail file */
  // onThumbnailChange: (file: File) => void;
}

import { X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

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
  // onThumbnailChange,
}) => {
  // const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     // onThumbnailChange(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setThumbnailPreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // console.log('field.value',field.value);

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // setThumbnailPreview(null);
          onClose();
        }
      }}
    >
      <Modal.Portal>
        <Modal.Content className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl z-[101] border border-gray-100 dark:border-gray-800 focus:outline-none overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 p-6">
            <div>
              <Modal.Title className="text-xl font-bold text-gray-900 dark:text-white">
                {type === 'create'
                  ? 'Create New Leaderboard'
                  : 'Edit Leaderboard'}
              </Modal.Title>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fill in the details to {type === 'create' ? 'launch' : 'update'}{' '}
                your leaderboard.
              </p>
            </div>
            <Modal.Close className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </Modal.Close>
          </div>

          <Form
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-y-auto p-6 space-y-6 flex-1"
          >
            {/* Thumbnail Upload */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Leaderboard Thumbnail
              </label>
              <div
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 px-6 py-8 text-center hover:border-primary dark:hover:border-gray-600 transition-all cursor-pointer overflow-hidden"
                onClick={() =>
                  document.getElementById('thumbnail-input')?.click()
                }
              >
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Preview"
                    fill
                    className="object-cover opacity-50"
                  />
                ) : (
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                    <Icon
                      name="image"
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </div>
                )}
                <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400 relative z-10">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Upload a file
                  </span>{' '}
                  or drag and drop
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 relative z-10">
                  PNG, JPG up to 5MB
                </p>
                <input
                  type="file"
                  id="thumbnail-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div> */}

            {/* Name & Club Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field id="name" label="Name" error={errors.name?.message}>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder="e.g. Summer Sprint Challenge"
                />
              </Field>

              <Field id="clubId" label="Club" error={errors.clubId?.message}>
                <div className="relative">
                  <select
                    {...register('clubId')}
                    id="clubId"
                    className="h-11 w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    <option value="">No Club (General)</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
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
                placeholder="Describe the rules and goals of this leaderboard..."
              />
            </Field>

            {/* Expiration Date */}
            <Field
              id="expiryDate"
              label="Expiration Date"
              error={errors.expiryDate?.message}
            >
              {/* <div className="relative">
                <Input
                  {...register('expiryDate')}
                  type="date"
                  id="expiryDate"
                  className="pr-12"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <Icon name="calendar_today" className="text-sm" />
                </div>
              </div> */}
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`h-11 w-full flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 px-4 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
                          field.value
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
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

            {/* Visibility Switch */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Visibility
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 relative">
                  Public leaderboards are visible to everyone.
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
                      className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-pointer transition-colors shadow-sm"
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-white/5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {type === 'create' ? 'Create Leaderboard' : 'Save Changes'}
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
};
