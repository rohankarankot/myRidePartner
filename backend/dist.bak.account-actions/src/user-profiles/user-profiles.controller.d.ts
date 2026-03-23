import { UserProfilesService } from './user-profiles.service';
import { Gender } from '@prisma/client';
export declare class UserProfilesController {
    private readonly userProfilesService;
    constructor(userProfilesService: UserProfilesService);
    create(createData: {
        fullName: string;
        phoneNumber: string;
        gender: Gender;
        userId: number;
    }): Promise<{
        user: {
            id: number;
            username: string | null;
            email: string;
            provider: string | null;
            password: string | null;
            resetPasswordToken: string | null;
            confirmationToken: string | null;
            confirmed: boolean;
            blocked: boolean;
            role: import("@prisma/client").$Enums.UserRole;
            accountStatus: import("@prisma/client").$Enums.UserAccountStatus;
            pausedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rating: import("@prisma/client-runtime-utils").Decimal | null;
        fullName: string | null;
        phoneNumber: string | null;
        avatar: string | null;
        completedTripsCount: number;
        ratingsCount: number;
        isVerified: boolean;
        governmentIdVerified: boolean;
        gender: import("@prisma/client").$Enums.Gender | null;
        city: string | null;
        pushToken: string | null;
        userId: number;
    }>;
    findByUserId(userId: string): Promise<{
        user: {
            id: number;
            username: string | null;
            email: string;
            provider: string | null;
            password: string | null;
            resetPasswordToken: string | null;
            confirmationToken: string | null;
            confirmed: boolean;
            blocked: boolean;
            role: import("@prisma/client").$Enums.UserRole;
            accountStatus: import("@prisma/client").$Enums.UserAccountStatus;
            pausedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rating: import("@prisma/client-runtime-utils").Decimal | null;
        fullName: string | null;
        phoneNumber: string | null;
        avatar: string | null;
        completedTripsCount: number;
        ratingsCount: number;
        isVerified: boolean;
        governmentIdVerified: boolean;
        gender: import("@prisma/client").$Enums.Gender | null;
        city: string | null;
        pushToken: string | null;
        userId: number;
    }>;
    update(id: string, updateData: any): Promise<{
        user: {
            id: number;
            username: string | null;
            email: string;
            provider: string | null;
            password: string | null;
            resetPasswordToken: string | null;
            confirmationToken: string | null;
            confirmed: boolean;
            blocked: boolean;
            role: import("@prisma/client").$Enums.UserRole;
            accountStatus: import("@prisma/client").$Enums.UserAccountStatus;
            pausedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        rating: import("@prisma/client-runtime-utils").Decimal | null;
        fullName: string | null;
        phoneNumber: string | null;
        avatar: string | null;
        completedTripsCount: number;
        ratingsCount: number;
        isVerified: boolean;
        governmentIdVerified: boolean;
        gender: import("@prisma/client").$Enums.Gender | null;
        city: string | null;
        pushToken: string | null;
        userId: number;
    }>;
}
