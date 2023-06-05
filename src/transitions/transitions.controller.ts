import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseFilters,
} from '@nestjs/common';
import { StartTransitionDto } from './dto/start-transition.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { MobileVerificationGuard } from 'src/auth/guards/mobile-verification.guard';
import { GetCurrentUser } from 'src/utils';
import { SyriatelService } from './services/syriatel.service';
import { HttpExceptionFilter } from 'src/http-exception.filter';
import { UsersService } from 'src/users/users.service';
import { MtnService } from './services/mtn.service';
import { SimProviderEnum } from 'src/users/users.entity';

@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new HttpExceptionFilter())
@Controller('/api/v1/transitions')
export class TransitionsController {
  constructor(
    private readonly syriatelService: SyriatelService,
    private readonly userService: UsersService,
    private readonly mtnService: MtnService,
  ) {}

  @UseGuards(JwtAuthGuard, MobileVerificationGuard)
  @Post('start')
  async startPointsTransition(
    @Body(new ValidationPipe()) transitionDto: StartTransitionDto,
    @GetCurrentUser() reqUser: any,
  ) {
    const userMobile: string = reqUser.mobile;
    const user = await this.userService.findOne(userMobile);
    if (user.sim_provider === SimProviderEnum.SYRIATEL)
      return await this.syriatelService.recharge(
        userMobile,
        transitionDto.amount,
        transitionDto.location,
        user,
      );
    return await this.mtnService.recharge(
      userMobile,
      transitionDto.amount,
      user,
    );
  }
}
