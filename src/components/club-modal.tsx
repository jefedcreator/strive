'use client';

import { type clubValidatorSchema } from '@/backend/validators/club.validator';
import { Form, Field, Input, Textarea, Button } from '@/primitives';
import { Modal } from '@/primitives/Modal';
import * as Switch from '@radix-ui/react-switch';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormHandleSubmit,
} from 'react-hook-form';
import { type z } from 'zod';

export type ClubFormValues = z.input<typeof clubValidatorSchema>;

interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'edit';
  /** react-hook-form register */
  register: UseFormRegister<ClubFormValues>;
  /** react-hook-form control (for Controller fields) */
  control: Control<ClubFormValues>;
  /** react-hook-form errors */
  errors: FieldErrors<ClubFormValues>;
  /** react-hook-form handleSubmit */
  handleSubmit: UseFormHandleSubmit<ClubFormValues>;
  /** Called with validated form data */
  onSubmit: (data: ClubFormValues) => void;
  /** Whether the mutation is currently in progress */
  isPending: boolean;
  /** Existing image URL for edit mode preview */
  existingImageUrl?: string | null;
  /** Called when user selects a thumbnail file */
  onThumbnailChange: (file: File) => void;
  /** Custom name field registration (for slug auto-generation) */
  nameRegister: ReturnType<UseFormRegister<ClubFormValues>>;
  /** Custom onChange handler for the name field */
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

import { X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export const ClubModal: React.FC<ClubModalProps> = ({
  isOpen,
  onClose,
  type,
  register,
  control,
  errors,
  handleSubmit,
  onSubmit,
  isPending,
  existingImageUrl,
  onThumbnailChange,
  nameRegister,
  onNameChange,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    existingImageUrl ?? null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onThumbnailChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setThumbnailPreview(existingImageUrl ?? null);
          onClose();
        }
      }}
    >
      <Modal.Portal>
        <Modal.Content className="fixed top-1/2 left-1/2 w-full max-w-2xl bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl z-[101] border border-gray-100 dark:border-gray-800 focus:outline-none overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 p-6">
            <div>
              <Modal.Title className="text-xl font-bold text-gray-900 dark:text-white">
                {type === 'create' ? 'Create New Club' : 'Edit Club'}
              </Modal.Title>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {type === 'create'
                  ? 'Set up a new community for your athletes.'
                  : 'Edit your club.'}
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Club Thumbnail
              </label>
              <div
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 px-6 py-8 text-center hover:border-primary dark:hover:border-gray-600 transition-all cursor-pointer overflow-hidden"
                onClick={() =>
                  document.getElementById('thumbnail-input-club')?.click()
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
                    <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                  id="thumbnail-input-club"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Name & Slug Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field id="name" label="Club Name" error={errors.name?.message}>
                <Input
                  {...nameRegister}
                  onChange={onNameChange}
                  id="name"
                  placeholder="e.g. NYC Runners Club"
                />
              </Field>

              <Field id="slug" label="Unique Slug" error={errors.slug?.message}>
                <div className="relative">
                  <Input
                    {...register('slug')}
                    id="slug"
                    placeholder="nyc-runners-club"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <LinkIcon className="text-gray-400 w-4 h-4" />
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
                placeholder="What is this club about?"
              />
            </Field>

            {/* Visibility Switch */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Visibility
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Public clubs can be found by anyone.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Private
                </span>
                <Controller
                  name="isPublic"
                  control={control}
                  render={({ field }) => (
                    <Switch.Root
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-pointer transition-colors"
                    >
                      <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-6" />
                    </Switch.Root>
                  )}
                />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
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
              {type === 'create' ? 'Create Club' : 'Save Changes'}
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
};
