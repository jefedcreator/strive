'use client';

import {
  updateUserValidatorSchema,
  type UpdateUserValidatorSchema,
} from '@/backend/validators/auth.validator';
import { Field, Form } from '@/primitives';
import { Button } from '@/primitives/Button';
import { Input } from '@/primitives/Input';
import { Modal } from '@/primitives/Modal';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User as UserType } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Camera, Loader2, Trash2, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axios, { type AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function SettingsClient({ user }: { user: UserType }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  //   const { data: userData, isLoading: isUserLoading } = useQuery<ApiResponse<any>>({
  //     queryKey: ['user', 'me'],
  //     queryFn: async () => {
  //       const res = await fetch('/api/users/me');
  //       if (!res.ok) throw new Error('Failed to fetch user profile');
  //       return res.json();
  //     },
  //   });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserValidatorSchema>({
    resolver: zodResolver(updateUserValidatorSchema),
    values: {
      username: user?.username ?? '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserValidatorSchema) => {
      const formData = new FormData();
      if (data.username) formData.append('username', data.username);
      if (data.avatar) formData.append('avatar', data.avatar);

      const res = await axios.put(`/api/users/me`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: async (data: UserType) => {
      toast.success('Profile updated successfully');
      router.refresh();
      setAvatarPreview(null);
      await update({
        image: data.avatar,
        username: data.username,
      });
      reset();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update profile');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/users/me`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/login' });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete account');
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('avatar', file, { shouldDirty: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account and profile information.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>

      <div className="bg-card-light dark:bg-card-dark rounded-2xl w-full flex md:flex-row flex-col justify-between border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Profile Photo
          </h2>
          <div className="relative group w-32 h-32 mx-auto md:mx-0">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {(() => {
                const avatarSrc = avatarPreview ?? user?.avatar;
                return avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                );
              })()}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera className="w-8 h-8 text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 text-center md:text-left">
            Click to change profile photo
          </p>
        </div>

        <Form
          onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))}
          className="space-y-6 w-full md:w-2/3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <Field
              id="username"
              label="Username"
              error={errors.username?.message}
            >
              <Input
                {...register('username')}
                id="username"
                placeholder="Enter your username"
              />
            </Field>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || updateProfileMutation.isPending}
              className="min-w-[120px]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Form>
      </div>

      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-2xl z-[100] outline-none">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <Modal.Title className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Delete Account?
              </Modal.Title>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                This action is permanent and cannot be undone. All your clubs,
                leaderboards, and synchronization data will be permanently
                deleted.
              </p>

              <div className="flex flex-col w-full gap-3 pt-4">
                <Button
                  variant="destructive"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black h-12 rounded-xl"
                  onClick={() => deleteAccountMutation.mutate()}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete Everything'
                  )}
                </Button>
                <Modal.Close asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                </Modal.Close>
              </div>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </div>
  );
}
