import { Injectable, Inject } from '@nestjs/common';
import config from 'config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userTypes } from 'src/shared/schema/users';
import { hashedPassword } from 'src/shared/utils/password.manager';
import { MailService } from 'src/mail/mail.service';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await hashedPassword(createUserDto.password);

      if (
        createUserDto.type === userTypes.ADMIN &&
        createUserDto.secretToken !== config.get('adminSecretToken')
      ) {
        throw new Error('Not allowed to create admin');
      } else {
        createUserDto.isVerified = true;
      }

      const user = await this.userRepository.findOne({
        email: createUserDto.email,
      });

      if (user) {
        throw new Error('User already exists');
      }

      const otp = Math.floor(Math.random() * 9000000) + 100000;
      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      const newUser = await this.userRepository.create({
        ...createUserDto,
        otp,
        otpExpiryTime,
      });

      if (newUser.type !== userTypes.ADMIN) {
        await this.mailService.sendUserConfirmation(newUser, otp);
      }

      return {
        success: true,
        message: 'User created successfully',
        result: { email: newUser.email },
      };
    } catch (error) {
      throw error;
    }
  }

  login(email: string, password: string) {
    return 'This action logs in a user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
