import { CreateOrderUseCase } from '@/domain/fastfood/application/use-cases/create-order'
import { GetAllOrderUseCase } from '@/domain/fastfood/application/use-cases/get-all-order'
import { GetOrderByIdUseCase } from '@/domain/fastfood/application/use-cases/get-order-by-id'
import { GetOrdersByStatusUseCase } from '@/domain/fastfood/application/use-cases/get-orders-by-status'
import { UpdateOrderPaymentStatusUseCase } from '@/domain/fastfood/application/use-cases/update-order-payment-status'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CreateOrderController } from './controllers/create-order.controller'
import { GetAllOrderController } from './controllers/get-all-order.controller'
import { GetOrderByIdController } from './controllers/get-order-by-id.controller'
import { GetOrderDetailsController } from './controllers/get-order-details.controller'
import { GetOrdersByStatusController } from './controllers/get-orders-by-status.controller'
import { UpdateOrderPaymentStatusController } from './controllers/update-order-payment-status.controller'
import { MicroserviceCommunicationService } from './services/microservice-communication.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    GetAllOrderController,
    CreateOrderController,
    GetOrderByIdController,
    GetOrderDetailsController,
    GetOrdersByStatusController,
    UpdateOrderPaymentStatusController
  ],
  providers: [
    GetAllOrderUseCase,
    CreateOrderUseCase,
    GetOrderByIdUseCase,
    GetOrdersByStatusUseCase,
    UpdateOrderPaymentStatusUseCase,
    MicroserviceCommunicationService
  ]
})
export class HttpModule {}
