import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SimProviderEnum, UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { AuthDto } from 'src/auth/dtos';
import { hash } from 'src/utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findOne(mobile: string): Promise<UserEntity | undefined> {
    const user = this.usersRepo.findOne({ where: { mobile } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findUserById(userId: number): Promise<UserEntity | undefined> {
    const user = this.usersRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException();
    return user;
  }
  async createUser(
    authDto: AuthDto,
    simProvider: SimProviderEnum,
    isPrePaid: boolean,
  ): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({
      where: { mobile: authDto.mobile },
    });
    if (user) {
      throw new ConflictException('User already exist');
    }

    const hashedPassword = await hash(authDto.password);

    const createdUser = this.usersRepo.create({
      name: authDto.name,
      mobile: authDto.mobile,
      password: hashedPassword,
      sim_provider: simProvider,
      is_pre_paid: isPrePaid,
    });

    return await this.usersRepo.save(createdUser);
  }

  async updateUserPassword(userId: number, password: string) {
    const hashedPassword = await hash(password);
    const updatedUser = await this.usersRepo.update(
      { user_id: userId },
      { password: hashedPassword },
    );
  }

  async verifyUser(userId: number) {
    const user = await this.usersRepo.update(
      { user_id: userId },
      { is_verified: true },
    );
  }

  async updateUserPoints(userId: number, points: number) {
    const updateUser = await this.usersRepo.update(
      { user_id: userId },
      { points },
    );
    return updateUser;
  }
}
