import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateOrderController } from './create-order.controller'

describe('Create Order Controller', () => {
  let sut: CreateOrderController
  let mockCreateOrderUseCase: any

  beforeEach(() => {
    mockCreateOrderUseCase = {
      execute: vi.fn()
    }

    sut = new CreateOrderController(mockCreateOrderUseCase)
  })

  it('should be able to create an order', async () => {
    const mockOrder = {
      id: 'order-1',
      customerId: 'customer-1',
      status: 'Pendente'
    }

    mockCreateOrderUseCase.execute.mockResolvedValue(
      right({ order: mockOrder })
    )

    const result = await sut.handle({
      customerId: 'customer-1',
      productIds: ['product-1']
    })

    expect(result).toEqual({ order: mockOrder })
    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      customerId: 'customer-1',
      productIds: ['product-1']
    })
  })

  it('should throw error when use case fails', async () => {
    mockCreateOrderUseCase.execute.mockResolvedValue(
      left({ message: 'Customer not found' })
    )

    await expect(
      sut.handle({
        customerId: 'invalid-customer',
        productIds: ['product-1']
      })
    ).rejects.toThrow()
  })
})
