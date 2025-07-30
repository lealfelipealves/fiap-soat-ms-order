import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOrdersByStatusController } from './get-orders-by-status.controller'

describe('Get Orders By Status Controller', () => {
  let sut: GetOrdersByStatusController
  let mockGetOrdersByStatusUseCase: any

  beforeEach(() => {
    mockGetOrdersByStatusUseCase = {
      execute: vi.fn()
    }

    sut = new GetOrdersByStatusController(mockGetOrdersByStatusUseCase)
  })

  it('should be able to get orders by status', async () => {
    const { Order } = await import('@/domain/fastfood/enterprise/entities')
    const { Status } = await import(
      '@/domain/fastfood/enterprise/entities/value-objects'
    )
    const { UniqueEntityID } = await import('@/core/entities/unique-entity-id')

    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    order1.status = Status.create(Status.RECEIVED)

    const order2 = Order.create({
      customerId: new UniqueEntityID('customer-2')
    })
    order2.status = Status.create(Status.RECEIVED)

    mockGetOrdersByStatusUseCase.execute.mockResolvedValue(
      right({ orders: [order1, order2] })
    )

    const result = await sut.handle({
      status: Status.RECEIVED
    })

    expect(result.orders).toHaveLength(2)
    expect(result.orders[0].customerId).toBe('customer-1')
    expect(result.orders[1].customerId).toBe('customer-2')
    expect(mockGetOrdersByStatusUseCase.execute).toHaveBeenCalledWith({
      status: Status.RECEIVED
    })
  })

  it('should be able to get orders by customer id', async () => {
    const { Order } = await import('@/domain/fastfood/enterprise/entities')
    const { UniqueEntityID } = await import('@/core/entities/unique-entity-id')

    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockGetOrdersByStatusUseCase.execute.mockResolvedValue(
      right({ orders: [order1] })
    )

    const result = await sut.handle({
      customerId: 'customer-1'
    })

    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].customerId).toBe('customer-1')
    expect(mockGetOrdersByStatusUseCase.execute).toHaveBeenCalledWith({
      customerId: 'customer-1'
    })
  })

  it('should be able to get orders by both status and customer id', async () => {
    const { Order } = await import('@/domain/fastfood/enterprise/entities')
    const { Status } = await import(
      '@/domain/fastfood/enterprise/entities/value-objects'
    )
    const { UniqueEntityID } = await import('@/core/entities/unique-entity-id')

    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    order1.status = Status.create(Status.RECEIVED)

    mockGetOrdersByStatusUseCase.execute.mockResolvedValue(
      right({ orders: [order1] })
    )

    const result = await sut.handle({
      status: Status.RECEIVED,
      customerId: 'customer-1'
    })

    expect(result.orders).toHaveLength(1)
    expect(result.orders[0].customerId).toBe('customer-1')
    expect(mockGetOrdersByStatusUseCase.execute).toHaveBeenCalledWith({
      status: Status.RECEIVED,
      customerId: 'customer-1'
    })
  })

  it('should throw error when use case fails', async () => {
    mockGetOrdersByStatusUseCase.execute.mockResolvedValue(
      left({ message: 'Database error' })
    )

    await expect(
      sut.handle({
        status: 'Pendente'
      })
    ).rejects.toThrow()
  })
})
