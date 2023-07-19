// import {
//   IsNotEmpty,
//   IsString,
//   IsEnum,
//   IsOptional,
//   IsBoolean,
// } from 'class-validator';
// import { userTypes } from 'src/shared/schema/users';
// export class CreateUserDto {
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @IsNotEmpty()
//   @IsString()
//   email: string;

//   @IsNotEmpty()
//   @IsString()
//   password: string;

//   @IsNotEmpty()
//   @IsString()
//   @IsEnum(userTypes)
//   type: string;

//   @IsString()
//   @IsOptional()
//   secretToken?: string;

//   @IsBoolean()
//   isVerified: boolean;
// }
