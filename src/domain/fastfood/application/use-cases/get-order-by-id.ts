import { Either, left, right } from '@/core/either'
import { OrderRepository } from '../repositories/order-repository'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '../../enterprise/entities'

interface GetOrderByIdRequest {
  id: string
}

type GetOrderByIdResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    id
  }: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    const order = await this.orderRepository.findById(id)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    return right({
      order
    })
  }
}
