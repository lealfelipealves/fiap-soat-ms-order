import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Order } from '../../enterprise/entities'
import { OrderRepository } from '../repositories/order-repository'

interface GetOrdersByStatusUseCaseRequest {
  status?: string
  customerId?: string
}

type GetOrdersByStatusUseCaseResponse = Either<
  null,
  {
    orders: Order[]
  }
>

@Injectable()
export class GetOrdersByStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    status,
    customerId
  }: GetOrdersByStatusUseCaseRequest): Promise<GetOrdersByStatusUseCaseResponse> {
    const orders = await this.orderRepository.getAll()

    let filteredOrders = orders

    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status?.getValue() === status
      )
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.customerId.toString() === customerId
      )
    }

    return right({
      orders: filteredOrders
    })
  }
}
