import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../shared/schema/users';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(query: any) {
    return await this.userModel.findOne(query);
  }

  async create(data: Record<string, any>) {
    return await this.userModel.create(data);
  }
}
