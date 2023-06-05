import { UserEntity } from 'src/users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AwardEntity } from './award.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
export enum SimProviderEnum {
  SYRIATEL = 'sy',
  MTN = 'mtn',
}

@Entity({ name: 'barcodes' })
export class BarcodesEntity {
  @Exclude()
  @PrimaryGeneratedColumn('uuid')
  readonly barcode_id: string;

  @ManyToOne(() => UserEntity, (user) => user.barcodes)
  @JoinColumn({ name: 'user_id' })
  readonly user: UserEntity;

  @ManyToOne(() => AwardEntity, (award) => award.barcodes, { nullable: true })
  @JoinColumn({ name: 'award_id' })
  readonly award: AwardEntity;

  @Exclude()
  @Column({ default: false })
  readonly is_used: boolean;

  @Exclude()
  @UpdateDateColumn()
  readonly used_at: Date;

  @Exclude()
  @CreateDateColumn()
  readonly created_at: Date;

  constructor(partial: Partial<BarcodesEntity>) {
    Object.assign(this, partial);
  }
}
