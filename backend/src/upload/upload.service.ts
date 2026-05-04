import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    return { secure_url: `file://${file.originalname}` };
  }

  async deleteFileByUrl(_url: string) {
    return;
  }
}
