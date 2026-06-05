import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock.user.findUnique.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('falls back to the legacy email lookup when a user read hits a missing column', async () => {
    const legacyUser = { id: 1, email: 'user@example.com' };
    prismaMock.user.findUnique.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('missing column', {
        code: 'P2022',
        clientVersion: 'test',
      }),
    );

    const legacySpy = jest
      .spyOn(service as any, 'findByEmailLegacy')
      .mockResolvedValueOnce(legacyUser);

    await expect(service.findByEmail('user@example.com')).resolves.toBe(
      legacyUser,
    );
    expect(legacySpy).toHaveBeenCalledWith('user@example.com');
  });
});
