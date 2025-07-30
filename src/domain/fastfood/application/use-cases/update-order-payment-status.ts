import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrderRepository } from '@/domain/fastfood/application/repositories/order-repository'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { Injectable } from '@nestjs/common'
import { PaymentStatus } from '../../enterprise/entities/value-objects'

interface UpdateOrderPaymentStatusUseCaseRequest {
  id: string
  paymentStatus: string
}

type UpdateOrderPaymentStatusUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

@Injectable()
export class UpdateOrderPaymentStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    id,
    paymentStatus
  }: UpdateOrderPaymentStatusUseCaseRequest): Promise<UpdateOrderPaymentStatusUseCaseResponse> {
    const order = await this.orderRepository.findById(id)

    if (!order) {
      return left(new ResourceNotFoundError())
    }

    order.paymentStatus = PaymentStatus.create(paymentStatus)

    await this.orderRepository.save(order)

    return right({ order })
  }
}
