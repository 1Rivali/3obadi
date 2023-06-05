import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransitionEntity } from '../entities/transitions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransitionService {
  constructor(
    @InjectRepository(TransitionEntity)
    private readonly transitionRepo: Repository<TransitionEntity>,
  ) {}

  async fetchPreviousTransitions(userId: number): Promise<TransitionEntity[]> {
    return await this.transitionRepo.find({
      where: { user: { user_id: userId }, is_accepted: true, is_success: true },
    });
  }
}
