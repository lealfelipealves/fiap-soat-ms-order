import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrderRepository } from '@/domain/fastfood/application/repositories/order-repository'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { MicroserviceCommunicationService } from '@/infra/http/services/microservice-communication.service'
import { Injectable } from '@nestjs/common'
import { OrderProduct } from '../../enterprise/entities/order-product'
import { OrderProductList } from '../../enterprise/entities/order-product-list'

interface CreateOrderUseCaseRequest {
  customerId: string
  productIds: string[]
}

type CreateOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly microserviceCommunication: MicroserviceCommunicationService
  ) {}

  async execute({
    customerId,
    productIds
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    try {
      // Validar se o cliente existe no microserviço de produção
      await this.microserviceCommunication.getCustomerByCpf(customerId)

      // Validar se todos os produtos existem no microserviço de produção
      for (const productId of productIds) {
        await this.microserviceCommunication.getProductById(productId)
      }

      const order = Order.create({
        customerId: new UniqueEntityID(customerId)
      })

      const orderProducts = productIds.map((productId) => {
        return OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID(productId)
        })
      })

      order.products = new OrderProductList(orderProducts)

      await this.orderRepository.create(order)

      return right({
        order
      })
    } catch {
      return left(new ResourceNotFoundError())
    }
  }
}
