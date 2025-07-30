import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOrderByIdUseCase } from './get-order-by-id'

describe('Get Order By Id', () => {
  let sut: GetOrderByIdUseCase
  let mockOrderRepository: any

  beforeEach(() => {
    mockOrderRepository = {
      findById: vi.fn()
    }

    sut = new GetOrderByIdUseCase(mockOrderRepository)
  })

  it('should be able to get an order by id', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)

    const result = await sut.execute({
      id: 'order-1'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order).toBe(order)
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-1')
    }
  })

  it('should return error when order is not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null)

    const result = await sut.execute({
      id: 'non-existent'
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
