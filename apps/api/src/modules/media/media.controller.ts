import { Controller, Get, Post, Delete, Param, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService, CreateMediaAssetDto } from './media.service';
import { ActiveTenant } from '../tenant/tenant.decorator';
import { Public } from '../auth/public.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media assets for active business tenant' })
  async findAll(
    @ActiveTenant() businessId: string,
    @Query('category') category?: string,
  ) {
    const assets = await this.mediaService.findAll(businessId, category);
    return assets.map((a) => ({
      ...a,
      sizeBytes: Number(a.sizeBytes),
    }));
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create/Upload new media asset record' })
  async create(
    @ActiveTenant() businessId: string,
    @Body() dto: CreateMediaAssetDto,
  ) {
    const defaultBusiness = businessId || (await this.mediaService['prisma'].business.findFirst())?.id;
    const asset = await this.mediaService.createAsset(defaultBusiness, dto);
    return {
      ...asset,
      sizeBytes: Number(asset.sizeBytes),
    };
  }

  @Public()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `file-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload file directly from computer' })
  async uploadFile(
    @ActiveTenant() businessId: string,
    @UploadedFile() file: any,
  ) {
    const defaultBusiness = businessId || (await this.mediaService['prisma'].business.findFirst())?.id;
    const fileUrl = `http://localhost:4000/uploads/${file.filename}`;

    const asset = await this.mediaService.createAsset(defaultBusiness, {
      filename: file.originalname,
      url: fileUrl,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category: file.mimetype.startsWith('image/') ? 'PRODUCT' : 'DOCUMENT',
    });

    return {
      url: fileUrl,
      filename: file.originalname,
      asset: {
        ...asset,
        sizeBytes: Number(asset.sizeBytes),
      },
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media asset' })
  async remove(
    @ActiveTenant() businessId: string,
    @Param('id') id: string,
  ) {
    const deleted = await this.mediaService.deleteAsset(businessId, id);
    return {
      ...deleted,
      sizeBytes: Number(deleted.sizeBytes),
    };
  }
}
