import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { MicroserviceCommunicationService } from '@/infra/http/services/microservice-communication.service'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateOrderUseCase } from './create-order'

describe('Create Order', () => {
  let sut: CreateOrderUseCase
  let mockOrderRepository: any
  let microserviceCommunication: MicroserviceCommunicationService

  beforeEach(() => {
    mockOrderRepository = {
      create: vi.fn()
    }

    microserviceCommunication = {
      getCustomerByCpf: vi.fn(),
      getProductById: vi.fn(),
      notifyPaymentService: vi.fn(),
      updateOrderStatus: vi.fn()
    } as any

    sut = new CreateOrderUseCase(mockOrderRepository, microserviceCommunication)
  })

  it('should be able to create an order', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    const mockProduct = {
      id: 'product-1',
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    }

    vi.mocked(microserviceCommunication.getCustomerByCpf).mockResolvedValue(
      mockCustomer
    )
    vi.mocked(microserviceCommunication.getProductById).mockResolvedValue(
      mockProduct
    )

    const result = await sut.execute({
      customerId: '12345678901',
      productIds: ['product-1']
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order).toBeTruthy()
      expect(result.value.order.customerId.toString()).toBe('12345678901')
    }
  })

  it('should be able to create an order with multiple products', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    const mockProduct1 = {
      id: 'product-1',
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    }

    const mockProduct2 = {
      id: 'product-2',
      name: 'Fries',
      description: 'Delicious fries',
      price: 8.99,
      category: 'Acompanhamento'
    }

    vi.mocked(microserviceCommunication.getCustomerByCpf).mockResolvedValue(
      mockCustomer
    )
    vi.mocked(microserviceCommunication.getProductById)
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2)

    const result = await sut.execute({
      customerId: '12345678901',
      productIds: ['product-1', 'product-2']
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order).toBeTruthy()
      expect(result.value.order.products.getItems()).toHaveLength(2)
    }
  })

  it('should return error when customer is not found', async () => {
    vi.mocked(microserviceCommunication.getCustomerByCpf).mockRejectedValue(
      new Error('Customer not found')
    )

    const result = await sut.execute({
      customerId: 'invalid-cpf',
      productIds: ['product-1']
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should return error when product is not found', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    vi.mocked(microserviceCommunication.getCustomerByCpf).mockResolvedValue(
      mockCustomer
    )
    vi.mocked(microserviceCommunication.getProductById).mockRejectedValue(
      new Error('Product not found')
    )

    const result = await sut.execute({
      customerId: '12345678901',
      productIds: ['invalid-product']
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should validate customer before creating order', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    const mockProduct = {
      id: 'product-1',
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    }

    vi.mocked(microserviceCommunication.getCustomerByCpf).mockResolvedValue(
      mockCustomer
    )
    vi.mocked(microserviceCommunication.getProductById).mockResolvedValue(
      mockProduct
    )

    await sut.execute({
      customerId: '12345678901',
      productIds: ['product-1']
    })

    expect(microserviceCommunication.getCustomerByCpf).toHaveBeenCalledWith(
      '12345678901'
    )
  })

  it('should validate all products before creating order', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    }

    const mockProduct1 = {
      id: 'product-1',
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    }

    const mockProduct2 = {
      id: 'product-2',
      name: 'Fries',
      description: 'Delicious fries',
      price: 8.99,
      category: 'Acompanhamento'
    }

    vi.mocked(microserviceCommunication.getCustomerByCpf).mockResolvedValue(
      mockCustomer
    )
    vi.mocked(microserviceCommunication.getProductById)
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2)

    await sut.execute({
      customerId: '12345678901',
      productIds: ['product-1', 'product-2']
    })

    expect(microserviceCommunication.getProductById).toHaveBeenCalledWith(
      'product-1'
    )
    expect(microserviceCommunication.getProductById).toHaveBeenCalledWith(
      'product-2'
    )
    expect(microserviceCommunication.getProductById).toHaveBeenCalledTimes(2)
  })
})
