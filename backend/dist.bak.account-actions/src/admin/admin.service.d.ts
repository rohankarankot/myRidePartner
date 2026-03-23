import { PrismaService } from '../prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        totalUsers: number;
        totalTrips: number;
        completedTrips: number;
        approvedRequests: number;
        recentUsers: ({
            userProfile: {
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
            } | null;
        } & {
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
        })[];
        tripsByStatus: {
            status: import("@prisma/client").$Enums.TripStatus;
            count: number;
        }[];
        registrationsByMonth: {
            month: string;
            count: any;
        }[];
        activityByDay: any[];
    }>;
    private aggregateByMonth;
    private aggregateByDay;
    getUsers(): Promise<({
        userProfile: {
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
        } | null;
        _count: {
            createdTrips: number;
            joinRequests: number;
        };
    } & {
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
    })[]>;
    getTrips(): Promise<({
        _count: {
            joinRequests: number;
        };
        creator: {
            userProfile: {
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
            } | null;
        } & {
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
        city: string | null;
        description: string | null;
        documentId: string;
        startingPoint: string;
        destination: string;
        date: string;
        time: string;
        availableSeats: number;
        pricePerSeat: import("@prisma/client-runtime-utils").Decimal | null;
        isPriceCalculated: boolean;
        genderPreference: import("@prisma/client").$Enums.GenderPreference;
        status: import("@prisma/client").$Enums.TripStatus;
        creatorId: number;
    })[]>;
    getJoinRequests(): Promise<({
        trip: {
            creator: {
                userProfile: {
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
                } | null;
            } & {
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
            city: string | null;
            description: string | null;
            documentId: string;
            startingPoint: string;
            destination: string;
            date: string;
            time: string;
            availableSeats: number;
            pricePerSeat: import("@prisma/client-runtime-utils").Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        };
        passenger: {
            userProfile: {
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
            } | null;
        } & {
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
        message: string | null;
        documentId: string;
        status: import("@prisma/client").$Enums.JoinRequestStatus;
        requestedSeats: number;
        tripId: number;
        passengerId: number;
    })[]>;
}
