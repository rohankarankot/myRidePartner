import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TripsService, TripFilters } from './trips.service';
import { Prisma } from '@prisma/client';
import { PaginationParams } from 'apps/api-gateway/src/common/utils/query.utils';

@Controller()
export class TripsController {
  constructor(private readonly tripsService: TripsService) { }

  @MessagePattern({ cmd: 'findAllTrips' })
  async findAll(@Payload() payload: { pagination: PaginationParams; filters?: TripFilters }) {
    return this.tripsService.findAll(payload.pagination, payload.filters);
  }

  @MessagePattern({ cmd: 'findByDocumentId' })
  async findByDocumentId(@Payload() payload: { documentId: string }) {
    return this.tripsService.findByDocumentId(payload.documentId);
  }

  @MessagePattern({ cmd: 'findAccessibleByDocumentId' })
  async findAccessibleByDocumentId(@Payload() payload: { documentId: string; viewerId: number }) {
    return this.tripsService.findAccessibleByDocumentId(payload.documentId, payload.viewerId);
  }

  @MessagePattern({ cmd: 'findPublicByDocumentId' })
  async findPublicByDocumentId(@Payload() payload: { documentId: string }) {
    return this.tripsService.findPublicByDocumentId(payload.documentId);
  }

  @MessagePattern({ cmd: 'findByCreatorId' })
  async findByCreatorId(@Payload() payload: { userId: number; viewerId?: number }) {
    return this.tripsService.findByCreatorId(payload.userId, payload.viewerId);
  }

  @MessagePattern({ cmd: 'createTrip' })
  async create(@Payload() payload: { description?: string; startingPoint: string; destination: string; date: string; time: string; availableSeats: number; city?: string; pricePerSeat?: number; isPriceCalculated: boolean; genderPreference: string; creator: number; }) {
    return this.tripsService.create(payload);
  }

  @MessagePattern({ cmd: 'updateTrip' })
  async update(@Payload() payload: { documentId: string; data: Prisma.TripUpdateInput; actorUserId?: number }) {
    return this.tripsService.update(payload.documentId, payload.data, payload.actorUserId);
  }

  @MessagePattern({ cmd: 'deleteTrip' })
  async delete(@Payload() payload: { documentId: string }) {
    return this.tripsService.delete(payload.documentId);
  }
}
