import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserStatus } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[] | undefined> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      select: [
        'name',
        'email',
        'password',
        'institution',
        'city',
        'workType',
        'educationLevel',
      ],
      where: { email: email },
    });
  }

  create(user: User) {
    return this.usersRepository.save(user);
  }

  update(id: number, status: UserStatus) {
    return this.usersRepository.update(id, { status: status });
  }

  set(user: User) {
    return this.usersRepository.save(user);
  }
}
