'use client';

import { Button } from '@/primitives/Button';
import { Input } from '@/primitives/Input';
import { Modal } from '@/primitives/Modal';
import React from 'react';
import { SiNike } from 'react-icons/si';
import type { NRCLoginStep } from '@/hooks/useNRCLogin';
import { Field, Form } from '@/primitives';
import { useForm } from 'react-hook-form';

interface NRCEmailFormValues {
  email: string;
}

interface NRCCodeFormValues {
  code: string;
}

interface NRCLoginModalProps {
  sessionStep: NRCLoginStep;
  isSubmitting: boolean;
  submitEmail: (email: string) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  code: string;
  setCode: (code: string) => void;
  error: string | null;
  reset: () => void;
}

export function NRCLoginModal({
  sessionStep,
  isSubmitting,
  submitEmail,
  submitCode,
  email,
  setEmail,
  code,
  setCode,
  error,
  reset,
}: NRCLoginModalProps) {
  const isEmailScreen =
    sessionStep === 'email-modal' || sessionStep === 'awaiting-code';
  const isCodeScreen =
    sessionStep === 'code-modal' || sessionStep === 'processing';
  const isSuccessScreen = sessionStep === 'success';
  const isErrorScreen = sessionStep === 'error';

  const isOpen = isEmailScreen || isCodeScreen || isSuccessScreen || isErrorScreen;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && reset()}
    >
      <Modal.Portal>
        <Modal.Content
          onInteractOutside={(e) => !isSubmitting && reset()}
          onEscapeKeyDown={(e) => !isSubmitting && reset()}
          className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md bg-card-light dark:bg-card-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden outline-none"
        >
          {!isSubmitting && (
            <button
              onClick={reset}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors z-[60]"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <div className="relative p-8 md:p-10">
            {isErrorScreen ? (
              <ErrorStep error={error} reset={reset} />
            ) : isSuccessScreen ? (
              <SuccessStep />
            ) : isEmailScreen ? (
              <EmailStep
                email={email}
                setEmail={setEmail}
                submitEmail={submitEmail}
                isSubmitting={isSubmitting}
              />
            ) : (
              <CodeStep
                email={email}
                code={code}
                setCode={setCode}
                submitCode={submitCode}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal>
  );
}

function EmailStep({
  email,
  setEmail,
  submitEmail,
  isSubmitting,
}: {
  email: string;
  setEmail: (email: string) => void;
  submitEmail: (email: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NRCEmailFormValues>({
    mode: 'onChange',
    defaultValues: { email },
  });

  const emailRegister = register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void emailRegister.onChange(e);
    setEmail(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform cursor-default">
          <SiNike className="h-10 w-16 text-white dark:text-black" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Nike Connection
        </h2>
        <p className="mt-2 text-sm md:text-base font-medium text-gray-500 dark:text-gray-400">
          Enter your NRC account email to continue.
        </p>
      </div>
      <Form
        onSubmit={handleSubmit((data) => submitEmail(data.email))}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Field
            id="email"
            label="Nike Email Address"
            error={errors.email?.message}
          >
            <Input
              {...emailRegister}
              onChange={handleEmailChange}
              id="email"
              type="email"
              disabled={isSubmitting}
              placeholder="name@example.com"
              className="h-14 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-base md:text-lg"
            />
          </Field>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full h-14 text-lg font-black bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-2xl shadow-xl transform active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 rounded-full border-3 border-white dark:border-black border-t-transparent animate-spin" />
                <span>Initializing...</span>
              </div>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] md:text-xs text-center text-gray-400 dark:text-gray-500 pt-4">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Secure, ephemeral connection. No passwords stored.</span>
        </div>
      </Form>
    </>
  );
}

function CodeStep({
  email,
  code,
  setCode,
  submitCode,
  isSubmitting,
}: {
  email: string;
  code: string;
  setCode: (code: string) => void;
  submitCode: (code: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<NRCCodeFormValues>({
    mode: 'onChange',
    defaultValues: { code },
  });

  const codeRegister = register('code', {
    required: 'Code is required',
    pattern: {
      value: /^\d{8}$/,
      message: 'Code must be 8 digits',
    },
  });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numbers
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setValue('code', value, { shouldValidate: true });
    setCode(value);
  };

  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Verification Required
        </h2>
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Enter the 8-digit code sent to:
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
            {email.toLowerCase()}
          </p>
        </div>
      </div>

      <Form
        onSubmit={handleSubmit((data) => submitCode(data.code))}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Field
            id="code"
            label="8-Digit Security Code"
            error={errors.code?.message}
          >
            <Input
              {...codeRegister}
              onChange={handleCodeChange}
              id="code"
              type="number"
              disabled={isSubmitting}
              placeholder="00000000"
              className="h-14 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-primary text-center text-2xl font-mono tracking-[0.5em] focus:tracking-[0.5em] placeholder:tracking-normal placeholder:font-sans transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
              maxLength={8}
              autoFocus
            />
          </Field>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full h-14 text-lg font-black bg-[#FC4C02] hover:bg-[#e34402] text-white rounded-2xl shadow-xl transform active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 rounded-full border-3 border-white border-t-transparent animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify & Connect'
            )}
          </Button>
        </div>

        <p className="text-[10px] md:text-xs text-center text-gray-400 dark:text-gray-500 pt-4 leading-relaxed">
          Haven&#39;t received a code? Check your spam folder or wait a few
          minutes before trying again.
        </p>
      </Form>
    </>
  );
}
function SuccessStep() {
  return (
    <div className="flex flex-col items-center text-center py-4">
      {/* Animated checkmark ring */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-30" />
        <div className="relative w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-sm">
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
        You&apos;re Connected!
      </h2>
      <p className="mt-2 text-sm md:text-base font-medium text-gray-500 dark:text-gray-400">
        Nike Run Club account verified successfully.
      </p>

      {/* Redirect indicator */}
      <div className="mt-8 flex items-center justify-center gap-2.5 text-sm font-semibold text-gray-400 dark:text-gray-500">
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
        <span>Taking you to your dashboard&hellip;</span>
      </div>
    </div>
  );
}

function ErrorStep({
  error,
  reset,
}: {
  error: string | null;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
        Login Error
      </h2>
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl w-full">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 leading-relaxed">
          {error || 'An unexpected error occurred during login.'}
        </p>
      </div>

      <div className="mt-8 w-full">
        <Button
          onClick={reset}
          className="w-full h-14 text-lg font-black bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-2xl shadow-xl transform active:scale-[0.98] transition-all"
        >
          Try Again
        </Button>
      </div>

      <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500 leading-relaxed">
        If this persists, please try clearing your browser cache or wait a few
        minutes before attempting to sign in again.
      </p>
    </div>
  );
}
