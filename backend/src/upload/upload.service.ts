import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_SECRET'),
    });
  }

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'myridepartner/avatars' },
        (error, result) => {
          if (error) {
            return reject(
              new InternalServerErrorException('Cloudinary upload failed'),
            );
          }
          if (result) resolve(result);
          else {
            reject(
              new InternalServerErrorException('Empty result from Cloudinary'),
            );
          }
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(fileUrl);

    if (!publicId) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch {
      throw new InternalServerErrorException('Cloudinary delete failed');
    }
  }

  private extractPublicIdFromUrl(fileUrl: string): string | null {
    try {
      const parsed = new URL(fileUrl);
      const uploadSegment = '/upload/';
      const uploadIndex = parsed.pathname.indexOf(uploadSegment);

      if (uploadIndex === -1) {
        return null;
      }

      const uploadPath = parsed.pathname.slice(
        uploadIndex + uploadSegment.length,
      );
      const pathWithoutVersion = uploadPath.replace(/^v\d+\//, '');
      const lastDotIndex = pathWithoutVersion.lastIndexOf('.');

      if (lastDotIndex === -1) {
        return pathWithoutVersion;
      }

      return pathWithoutVersion.slice(0, lastDotIndex);
    } catch {
      return null;
    }
  }
}
