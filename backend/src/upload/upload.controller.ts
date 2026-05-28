import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Express } from 'express';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({
    summary: 'Upload files',
    description: 'Upload one or more files to Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Files to upload',
        },
      },
    },
  })
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const responses: { id: string; url: string; publicId: string }[] = [];
    for (const file of files) {
      const res = await this.uploadService.uploadFile(file);
      responses.push({
        id: res.public_id,
        url: res.secure_url,
        publicId: res.public_id,
      });
    }

    return responses;
  }
}
