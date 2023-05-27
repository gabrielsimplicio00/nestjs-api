import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // desse jeito o módulo fica exposto pra toda a aplicacao e não é mais preciso adicionar o 'imports:' em todos os módulos que precisarem desse
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
