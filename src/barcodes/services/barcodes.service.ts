import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BarcodesEntity } from '../entities/barcodes.entity';
import { Repository } from 'typeorm';
import { AwardService } from './award.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BarcodesService {
  constructor(
    @InjectRepository(BarcodesEntity)
    private readonly barcodeRepo: Repository<BarcodesEntity>,
    private readonly awardService: AwardService,
    private readonly userService: UsersService,
  ) {}

  async ConsumeBarcode(barcodeID: string, userId: number) {
    const findBarcode: BarcodesEntity = await this.barcodeRepo.findOne({
      where: { barcode_id: barcodeID },
      relations: {
        award: true,
      },
    });
    if (findBarcode.is_used === true)
      throw new HttpException(
        'The Barcode is used before',
        HttpStatus.BAD_REQUEST,
      );
    if (findBarcode) {
      const award = await this.choosePoints();
      console.log(userId);
      const user = await this.userService.findUserById(userId);
      console.log(user);
      const dbAward = await this.awardService.findAward(award);
      const newPoints = user.points + parseInt(award);
      this.barcodeRepo.update(
        { barcode_id: barcodeID },
        { is_used: true, user: user, award: dbAward },
      );
      await this.userService.updateUserPoints(user.user_id, newPoints);

      return {
        message: `You have earned ${award} points`,
      };
    }
  }

  async fetchAllById(userId: number): Promise<BarcodesEntity[]> {
    const barcodesList = [];

    const barcodes: BarcodesEntity[] = await this.barcodeRepo.find({
      select: { award: { award_value: true } },
      where: { user: { user_id: userId } },
      relations: {
        award: true,
      },
    });
    barcodes.forEach((barcode) => {
      console.log(barcode.award.award_value);
      barcodesList.push({ points: barcode.award.award_value });
    });
    return barcodesList;
  }

  // Helper functions

  private async choosePoints() {
    const options = await this.awardService.fetchAwards();
    const totalPercentage = options.reduce(
      (acc, option) => acc + option.percentage,
      0,
    );
    const randomNumber = Math.random() * totalPercentage;
    let cumulativePercentage = 0;

    for (const option of options) {
      cumulativePercentage += option.percentage;
      if (randomNumber < cumulativePercentage) {
        return option.award_value;
      }
    }
  }
}
