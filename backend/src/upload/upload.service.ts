import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_KEY &&
    process.env.CLOUDINARY_SECRET,
  );

  constructor() {
    if (this.cloudinaryConfigured) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true,
      });
    }
  }

  async uploadFile(file: Express.Multer.File) {
    if (!this.cloudinaryConfigured) {
      throw new InternalServerErrorException(
        'Cloudinary is not configured for file uploads',
      );
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'myridepartner/trip-chat',
            resource_type: 'image',
          },
          (error, uploadResult) => {
            if (
              error ||
              !uploadResult?.secure_url ||
              !uploadResult?.public_id
            ) {
              reject(error || new Error('Cloudinary upload failed'));
              return;
            }

            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      },
    );

    return result;
  }

  async deleteFileByUrl(url: string) {
    if (!this.cloudinaryConfigured || !url?.trim()) {
      return;
    }

    const publicId = this.extractPublicId(url);
    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
  }

  async deleteFileByPublicId(publicId: string) {
    if (!this.cloudinaryConfigured || !publicId?.trim()) {
      return;
    }

    await cloudinary.uploader.destroy(publicId.trim(), {
      resource_type: 'image',
      invalidate: true,
    });
  }

  private extractPublicId(url: string) {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const uploadIndex = segments.indexOf('upload');
      if (uploadIndex === -1 || uploadIndex + 2 > segments.length) {
        return null;
      }

      const pathSegments = segments.slice(uploadIndex + 2);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (!lastSegment) {
        return null;
      }

      const withoutExtension = lastSegment.replace(/\.[a-z0-9]+$/i, '');
      return [...pathSegments.slice(0, -1), withoutExtension].join('/');
    } catch {
      return null;
    }
  }
}
