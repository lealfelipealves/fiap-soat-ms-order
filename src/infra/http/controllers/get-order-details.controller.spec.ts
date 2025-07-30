import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOrderDetailsController } from './get-order-details.controller'

describe('Get Order Details Controller', () => {
  let sut: GetOrderDetailsController
  let mockGetOrderByIdUseCase: any
  let mockMicroserviceCommunication: any

  beforeEach(() => {
    mockGetOrderByIdUseCase = {
      execute: vi.fn()
    }

    mockMicroserviceCommunication = {
      getCustomerByCpf: vi.fn(),
      getProductById: vi.fn()
    }

    sut = new GetOrderDetailsController(
      mockGetOrderByIdUseCase,
      mockMicroserviceCommunication
    )
  })

  it('should be able to get order details', async () => {
    const { Order } = await import('@/domain/fastfood/enterprise/entities')
    const { UniqueEntityID } = await import('@/core/entities/unique-entity-id')

    const mockOrder = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    const mockProduct = {
      id: 'product-1',
      name: 'X-Burger',
      price: 15.99
    }

    mockGetOrderByIdUseCase.execute.mockResolvedValue(
      right({ order: mockOrder })
    )
    mockMicroserviceCommunication.getCustomerByCpf.mockResolvedValue(
      mockCustomer
    )
    mockMicroserviceCommunication.getProductById.mockResolvedValue(mockProduct)

    const result = await sut.handle({
      id: 'order-1'
    })

    expect(result).toBeDefined()
    expect(result.order).toBeDefined()
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
