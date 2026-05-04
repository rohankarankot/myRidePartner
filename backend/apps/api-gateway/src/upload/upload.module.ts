import { Module } from '@nestjs/common';
import { UploadModule as CommonUploadModule } from '@app/common';
import { UploadController } from './upload.controller';

@Module({
  imports: [CommonUploadModule],
  controllers: [UploadController],
})
export class UploadModule {}
