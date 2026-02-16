import { env } from '@/env';
import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiOptions,
} from 'cloudinary';

export interface CloudinaryUploadOptions extends UploadApiOptions {
  folder?: string;
}

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Uploads a file buffer to Cloudinary.
   * @param fileBuffer - The buffer of the file to upload.
   * @param options - Cloudinary upload options.
   * @returns A promise that resolves to the upload response.
   */
  async uploadImage(
    fileBuffer: Buffer,
    options: CloudinaryUploadOptions = {}
  ): Promise<UploadApiResponse> {
    const { folder = 'strive', ...rest } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...rest,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error('Failed to upload file to Cloudinary'));
          }
          if (result) {
            return resolve(result);
          }
          reject(new Error('No response returned from Cloudinary'));
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Uploads a File object (from FormData) to Cloudinary.
   * @param file - The File object to upload.
   * @param options - Cloudinary upload options.
   * @returns A promise that resolves to the upload response.
   */
  async uploadFile(
    file: File,
    options: CloudinaryUploadOptions = {}
  ): Promise<UploadApiResponse> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return this.uploadImage(buffer, options);
  }

  /**
   * Deletes an image from Cloudinary using its public ID.
   * @param publicId - The public ID of the image to delete.
   * @returns A promise that resolves when the image is deleted.
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        console.warn(`Cloudinary delete warning for ${publicId}:`, result);
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  /**
   * Generates a transformed URL for an image.
   * @param publicId - The public ID of the image.
   * @param transformations - Transformation options.
   * @returns The transformed URL.
   */
  getTransformedUrl(publicId: string, transformations: object = {}): string {
    return cloudinary.url(publicId, transformations);
  }
}

export const cloudinaryService = new CloudinaryService();
