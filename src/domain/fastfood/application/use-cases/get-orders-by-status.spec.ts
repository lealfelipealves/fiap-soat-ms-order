import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { Status } from '@/domain/fastfood/enterprise/entities/value-objects'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOrdersByStatusUseCase } from './get-orders-by-status'

describe('Get Orders By Status', () => {
  let sut: GetOrdersByStatusUseCase
  let mockOrderRepository: any

  beforeEach(() => {
    mockOrderRepository = {
      getAll: vi.fn()
    }

    sut = new GetOrdersByStatusUseCase(mockOrderRepository)
  })

  it('should be able to get all orders', async () => {
    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    const order2 = Order.create({
      customerId: new UniqueEntityID('customer-2')
    })

    mockOrderRepository.getAll.mockResolvedValue([order1, order2])

    const result = await sut.execute({})

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(2)
      expect(mockOrderRepository.getAll).toHaveBeenCalled()
    }
  })

  it('should filter orders by status', async () => {
    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    order1.status = Status.create(Status.RECEIVED)

    const order2 = Order.create({
      customerId: new UniqueEntityID('customer-2')
    })
    order2.status = Status.create(Status.FINALIZED)

    mockOrderRepository.getAll.mockResolvedValue([order1, order2])

    const result = await sut.execute({
      status: Status.RECEIVED
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].status?.getValue()).toBe(Status.RECEIVED)
    }
  })

  it('should filter orders by customer id', async () => {
    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    const order2 = Order.create({
      customerId: new UniqueEntityID('customer-2')
    })

    mockOrderRepository.getAll.mockResolvedValue([order1, order2])

    const result = await sut.execute({
      customerId: 'customer-1'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].customerId.toString()).toBe('customer-1')
    }
  })

  it('should filter orders by both status and customer id', async () => {
    const order1 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    order1.status = Status.create(Status.RECEIVED)

    const order2 = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })
    order2.status = Status.create(Status.FINALIZED)

    const order3 = Order.create({
      customerId: new UniqueEntityID('customer-2')
    })
    order3.status = Status.create(Status.RECEIVED)

    mockOrderRepository.getAll.mockResolvedValue([order1, order2, order3])

    const result = await sut.execute({
      status: Status.RECEIVED,
      customerId: 'customer-1'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].customerId.toString()).toBe('customer-1')
      expect(result.value.orders[0].status?.getValue()).toBe(Status.RECEIVED)
    }
  })
})
