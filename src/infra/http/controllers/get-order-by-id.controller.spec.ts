import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOrderByIdController } from './get-order-by-id.controller'

describe('Get Order By Id Controller', () => {
  let sut: GetOrderByIdController
  let mockGetOrderByIdUseCase: any

  beforeEach(() => {
    mockGetOrderByIdUseCase = {
      execute: vi.fn()
    }

    sut = new GetOrderByIdController(mockGetOrderByIdUseCase)
  })

  it('should be able to get an order by id', async () => {
    const { Order } = await import('@/domain/fastfood/enterprise/entities')
    const { UniqueEntityID } = await import('@/core/entities/unique-entity-id')

    const mockOrder = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockGetOrderByIdUseCase.execute.mockResolvedValue(
      right({ order: mockOrder })
    )

    const result = await sut.handle({
      id: 'order-1'
    })

    expect(result.order).toBeDefined()
    expect(result.order.id).toBeDefined()
    expect(mockGetOrderByIdUseCase.execute).toHaveBeenCalledWith({
      id: { id: 'order-1' }
    })
  })

  it('should throw error when order is not found', async () => {
    mockGetOrderByIdUseCase.execute.mockResolvedValue(
      left({ message: 'Order not found' })
    )

    await expect(
      sut.handle({
        id: 'non-existent'
      })
    ).rejects.toThrow()
  })
})
