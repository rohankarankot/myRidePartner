import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleLogin(token: string): Promise<{
        access_token: string;
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
    }>;
    login(loginDto: any): Promise<{
        access_token: string;
        user: any;
    }>;
    getProfile(req: any): any;
}
