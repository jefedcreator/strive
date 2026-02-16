import type { DateRangeFilters } from '@/types';
import { getChildId } from '@/utils/getChildId';
import bcrypt from 'bcryptjs';
import { type ClassValue, clsx } from 'clsx';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';
import { generateUsername } from 'unique-username-generator';
import z from 'zod';

import { HttpException } from './exceptions';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const convertBase64ToFile = (base64: string, fileName: string) => {
  const arr = base64.split(',');
  const mime = arr?.[0]?.match(/:(.*?);/)?.[1];
  const bstr = atob(arr?.[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};

const isFile = (item: any): item is File => item instanceof File;

const hashPassword = async (payload: string) => {
  const hash = await bcrypt.hash(payload, 10);
  return hash;
};

const verifyPassword = async (payload: string, hash: string) => {
  return await bcrypt.compare(payload, hash);
};

const uniqueNumber = () => Date.now()?.toString()?.slice(-8);

/**
 *
 * @param error
 * @returns
 */
function parseHttpError(error: any) {
  console.error(error);
  if (error instanceof HttpException || error.statusCode) {
    return error.message;
  }
  return error?.response?.message || error?.cause || error?.toString();
}

/**
 *
 * @param filter
 * @returns
 */
function getDateRange(filter: DateRangeFilters) {
  let startDate, endDate;

  switch (filter) {
    case 'this-week':
      startDate = moment().startOf('week').toDate();
      endDate = moment().endOf('week').toDate();
      break;
    case 'last-week':
      startDate = moment().subtract(1, 'week').startOf('week').toDate();
      endDate = moment().subtract(1, 'week').endOf('week').toDate();
      break;
    case 'this-month':
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
      break;
    case 'last-month':
      startDate = moment().subtract(1, 'month').startOf('month').toDate();
      endDate = moment().subtract(1, 'month').endOf('month').toDate();
      break;
    case 'this-year':
      startDate = moment().startOf('year').toDate();
      endDate = moment().endOf('year').toDate();
      break;
    default:
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
      filter = DateRangeFilters.thisMonth;
      break;
  }

  return {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    filter,
  };
}

const isValidObjectId = (q?: string) => {
  if (!q) {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(q);
};

const parseTransactionStatus = (status?: string) => {
  if (status?.toLowerCase() != 'all') {
    return status?.toLowerCase();
  }
  return undefined;
};

const generateRandomString = (length = 6): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const genUsername = () => {
  // Try up to 5 times to generate a unique username
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const username = generateUsername('', 0, 8);
    // const userExists = await this.prisma.user.count({
    //   where: {
    //     username,
    //   },
    // });

    // if (userExists === 0) {
    //   return username;
    // }

    attempts++;
  }

  // If we couldn't find a unique username after 5 attempts
  // Add some random characters to make it unique
  const baseUsername = generateUsername('', 0, 6);
  const randomChars = generateRandomString();
  return `${baseUsername}${randomChars}`.substring(0, 12).toLowerCase();
};

const mongoIdValidator = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

export {
  cn,
  convertBase64ToFile,
  convertFileToBase64,
  generateRandomString,
  genUsername,
  getChildId,
  getDateRange,
  hashPassword,
  isFile,
  isValidObjectId,
  parseHttpError,
  parseTransactionStatus,
  twMerge,
  uniqueNumber,
  verifyPassword,
  mongoIdValidator,
  HttpException,
};
