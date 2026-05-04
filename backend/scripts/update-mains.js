const fs = require('fs');
const path = require('path');

const services = [
  { name: 'user-service', port: 3002 },
  { name: 'trip-service', port: 3003 },
  { name: 'chat-service', port: 3004 },
  { name: 'notification-service', port: 3005 },
];

for (const svc of services) {
  const mainFile = path.join(__dirname, '../apps', svc.name, 'src/main.ts');
  const moduleName = svc.name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Module';
  
  const content = `import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ${moduleName} } from './${svc.name}.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ${moduleName},
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: ${svc.port},
      },
    },
  );
  await app.listen();
}
bootstrap();
`;

  fs.writeFileSync(mainFile, content);
  console.log(`Updated ${svc.name}/src/main.ts`);
}
