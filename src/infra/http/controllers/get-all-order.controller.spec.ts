import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetAllOrderController } from './get-all-order.controller'

describe('Get All Order Controller', () => {
  let sut: GetAllOrderController
  let mockGetAllOrderUseCase: any

  beforeEach(() => {
    mockGetAllOrderUseCase = {
      execute: vi.fn()
    }

    sut = new GetAllOrderController(mockGetAllOrderUseCase)
  })

  it('should be able to get all orders', async () => {
    const mockOrders = [
      { id: 'order-1', customerId: 'customer-1', status: 'Pendente' },
      { id: 'order-2', customerId: 'customer-2', status: 'Finalizado' }
    ]

    mockGetAllOrderUseCase.execute.mockResolvedValue(
      right({ orders: mockOrders })
    )

    const result = await sut.handle()

    expect(result).toEqual({ orders: mockOrders })
    expect(mockGetAllOrderUseCase.execute).toHaveBeenCalled()
  })

  it('should throw error when use case fails', async () => {
    mockGetAllOrderUseCase.execute.mockResolvedValue(
      left({ message: 'Database error' })
    )

    await expect(sut.handle()).rejects.toThrow()
  })
})
