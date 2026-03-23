import { Gender } from '@prisma/client';
export declare class CreateUserProfileDto {
    fullName: string;
    phoneNumber: string;
    gender: Gender;
    userId: number;
}
export declare class UpdateUserProfileDto {
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    gender?: Gender;
    pushToken?: string;
}
