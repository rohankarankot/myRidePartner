import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    validate(payload: any): Promise<{
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
    }>;
}
export {};
