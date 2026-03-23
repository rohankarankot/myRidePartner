import { GenderPreference } from '@prisma/client';
export declare class CreateTripDto {
    description?: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    availableSeats: number;
    city?: string;
    pricePerSeat?: number;
    isPriceCalculated?: boolean;
    genderPreference?: GenderPreference;
    creatorId: number;
}
export declare class CreateTripBodyDto {
    data: CreateTripDto;
}
export declare class UpdateTripBodyDto {
    data: Partial<CreateTripDto>;
}
