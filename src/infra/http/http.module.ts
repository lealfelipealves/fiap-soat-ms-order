import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { GetOrderByIdUseCase } from '@/domain/fastfood/application/use-cases/get-order-by-id'
import { CreateOrderController } from './controllers/create-order.controller'
import { CreateOrderUseCase } from '@/domain/fastfood/application/use-cases/create-order'
import { GetAllOrderController } from './controllers/get-all-order.controller'
import { GetAllOrderUseCase } from '@/domain/fastfood/application/use-cases/get-all-order'
import { GetOrderByIdController } from './controllers/get-order-by-id.controller'
@Module({
  imports: [DatabaseModule],
  controllers: [
    GetAllOrderController,
    CreateOrderController,
    GetOrderByIdController,
  ],
  providers: [
    GetAllOrderUseCase,
    CreateOrderUseCase,
    GetOrderByIdUseCase,
  ]
})
export class HttpModule {}
