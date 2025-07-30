import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateOrderPaymentStatusUseCase } from './update-order-payment-status'

describe('Update Order Payment Status', () => {
  let sut: UpdateOrderPaymentStatusUseCase
  let mockOrderRepository: any

  beforeEach(() => {
    mockOrderRepository = {
      findById: vi.fn(),
      save: vi.fn()
    }

    sut = new UpdateOrderPaymentStatusUseCase(mockOrderRepository)
  })

  it('should be able to update order payment status', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)

    const result = await sut.execute({
      id: 'order-1',
      paymentStatus: 'Aprovado'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.paymentStatus?.getValue()).toBe('Aprovado')
      expect(mockOrderRepository.save).toHaveBeenCalledWith(order)
    }
  })

  it('should return error when order is not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null)

    const result = await sut.execute({
      id: 'non-existent',
      paymentStatus: 'Aprovado'
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should update payment status with different values', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)

    const result = await sut.execute({
      id: 'order-1',
      paymentStatus: 'Recusado'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.paymentStatus?.getValue()).toBe('Recusado')
    }
  })

  it('should call repository methods correctly', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)

    await sut.execute({
      id: 'order-1',
      paymentStatus: 'Aprovado'
    })

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-1')
    expect(mockOrderRepository.save).toHaveBeenCalledWith(order)
  })
})
