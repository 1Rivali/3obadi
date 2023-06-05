import {
  Controller,
  UseGuards,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseFilters,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { ConsumeBarcodeDto } from './dto';
import { AwardService } from './services/award.service';

import { BarcodesService } from './services/barcodes.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { MobileVerificationGuard } from 'src/auth/guards/mobile-verification.guard';
import { GetCurrentUser } from 'src/utils';
import { HttpExceptionFilter } from 'src/http-exception.filter';

@UseFilters(new HttpExceptionFilter())
@Controller('/api/v1/barcodes')
export class BarcodesController {
  constructor(
    private awardService: AwardService,
    private barcodeService: BarcodesService,
  ) {}

  // @Roles(UserRole.ADMIN)
  // @UseGuards(RolesGuard)

  @UseGuards(JwtAuthGuard, MobileVerificationGuard)
  @Post('/consume')
  async ConsumeBarcode(
    @Body(new ValidationPipe()) consumeBarcodeDto: ConsumeBarcodeDto,
    @GetCurrentUser() user: any,
  ) {
    const userId: number = user.userId;
    console.log(userId);
    const barcode = await this.barcodeService.ConsumeBarcode(
      consumeBarcodeDto.code,
      userId,
    );
    return barcode;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard, MobileVerificationGuard)
  @Get()
  async fetchScans(@GetCurrentUser() user: any) {
    const barcodes = await this.barcodeService.fetchAllById(user.userId);
    return barcodes;
  }
}
