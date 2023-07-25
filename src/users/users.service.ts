import { Injectable, Inject } from '@nestjs/common';
import config from 'config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userTypes } from 'src/shared/schema/users';
import {
  comparePassword,
  hashedPassword,
} from 'src/shared/utils/password.manager';
import { MailService } from 'src/mail/mail.service';
import { UserRepository } from './user.repository';
import { generateAuthToken } from 'src/shared/utils/token.generators';
import { Exception } from 'handlebars';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  /**************** CREATE USER CODES *******************/
  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await hashedPassword(createUserDto.password);

      if (
        createUserDto.type === userTypes.ADMIN &&
        createUserDto.secretToken !== config.get('adminSecretToken')
      ) {
        throw new Error('Not allowed to create admin');
      } else if (createUserDto.type !== userTypes.CUSTOMER) {
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
        message:
          newUser.type === userTypes.ADMIN
            ? 'Admin created'
            : 'Please verify your email',
        result: { email: newUser.email },
      };
    } catch (error) {
      throw error;
    }
  }

  /**************** LOGIN USER CODES *******************/
  async login(email: string, password: string) {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }
      if (!user.isVerified) {
        throw new Error('Please verify your email');
      }
      const isPasswordMatch = await comparePassword(password, user.password);

      if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
      }

      const token = await generateAuthToken(user._id);

      return {
        success: true,
        message: 'Login successful',
        result: {
          user: {
            name: user.name,
            email: user.email,
            type: user.type,
            id: user._id.toString(),
          },
          token,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**************** VERIFY USER CODES *******************/
  async verifyEmail(otp: string, email: string) {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.otp !== otp) {
        throw new Exception('Invalid Otp');
      }

      if (user.otpExpiryTime < new Date()) {
        throw new Error('Otp expired');
      }

      if (user.isVerified === true) {
        throw new Error('Email already verified');
      }

      await this.userRepository.updateOne({ email }, { isVerified: true });
      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**************** SEND OTP *******************/
  async sendOtpEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }
      if (user.isVerified) {
        throw new Error('User already verified');
      }

      const otp = Math.floor(Math.random() * 9000000) + 100000;

      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      await this.userRepository.updateOne(
        {
          email,
        },
        { otp, otpExpiryTime },
      );

      await this.mailService.sendUserOtp(user, otp);

      return {
        success: true,
        message: 'Otp sent successfully',
        result: { email: user.email },
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      let password = Math.random().toString(36).substring(2, 12);
      console.log(password);

      password = await hashedPassword(password);

      await this.userRepository.updateOne(
        {
          _id: user._id,
        },
        { password },
      );

      await this.mailService.forgotPassword(user, password);

      return {
        success: true,
        message: 'Password sent to email',
        result: { email: user.email },
      };
    } catch (error) {
      throw error;
    }
  }

  /**************** LOGIN USER CODES *******************/
  async findAll(type: string) {
    try {
      console.log(type);
      const users = await this.userRepository.find({ type });

      return {
        success: true,
        message: 'successfull',
        result: users,
      };
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  /**************** UPDATE PASSWORD  *******************/
  async updatePassword(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { oldPassword, newPassword, name } = updateUserDto;

      if (name && !newPassword) {
        throw new Error('Please provide name or password');
      }
      const user = await this.userRepository.findOne({ _id: id });
      if (!user) {
        throw new Error('User not found');
      }
      if (newPassword) {
        const isPasswordMatch = await comparePassword(
          oldPassword,
          user.password,
        );

        if (!isPasswordMatch) {
          throw new Error('Passwords not matched');
        }

        const password = await hashedPassword(newPassword);
        await this.userRepository.updateOne({ _id: id }, { password });
        if (name) {
          await this.userRepository.updateOne({ _id: id }, { name });
        }
      }

      return {
        success: true,
        message: 'User updated successfully',
        result: { email: user.email, name: user.name },
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
