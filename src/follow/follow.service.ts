import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'entity/follower.entity';
import { User } from 'entity/user.entity';
import { Repository } from 'typeorm';
import { runInThisContext } from 'vm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async follow(user, username): Promise<void> {
    const following = await this.userRepository.findOne({
      where: { username: username },
    });

    const exist = await this.followRepository.findOne({
      where: { follower: user, following: following },
    });

    if (exist != undefined) await this.followRepository.remove(exist);
    else {
      const follwerSystem: Follow = this.followRepository.create({
        follower: user,
        following: following,
      });
      await this.followRepository.save(follwerSystem);
    }
  }
}
