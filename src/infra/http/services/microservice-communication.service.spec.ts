import { HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  Customer,
  MicroserviceCommunicationService,
  Product
} from './microservice-communication.service'

describe('MicroserviceCommunicationService', () => {
  let service: MicroserviceCommunicationService
  let configService: ConfigService

  const mockConfigService = {
    get: vi.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroserviceCommunicationService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    service = module.get<MicroserviceCommunicationService>(
      MicroserviceCommunicationService
    )
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default URLs when config is not provided', () => {
      mockConfigService.get.mockReturnValue(undefined)

      new MicroserviceCommunicationService(configService)

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'PRODUCTION_SERVICE_URL'
      )
      expect(mockConfigService.get).toHaveBeenCalledWith('PAYMENT_SERVICE_URL')
    })

    it('should initialize with configured URLs', () => {
      mockConfigService.get
        .mockReturnValueOnce('http://production:3335')
        .mockReturnValueOnce('http://payment:3334')

      new MicroserviceCommunicationService(configService)

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'PRODUCTION_SERVICE_URL'
      )
      expect(mockConfigService.get).toHaveBeenCalledWith('PAYMENT_SERVICE_URL')
    })
  })

  describe('getCustomerByCpf', () => {
    it('should return customer when API call is successful', async () => {
      const mockCustomer: Customer = {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '12345678901'
      }

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ customer: mockCustomer })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const result = await service.getCustomerByCpf('12345678901')

      expect(result).toEqual(mockCustomer)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3335/customers/12345678901'
      )
    })

    it('should throw HttpException when customer is not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        HttpException
      )
      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        'Cliente não encontrado'
      )
    })

    it('should throw HttpException when API call fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        HttpException
      )
      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        'Erro ao buscar cliente'
      )
    })

    it('should throw HttpException when fetch throws an error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        HttpException
      )
      await expect(service.getCustomerByCpf('12345678901')).rejects.toThrow(
        'Erro de comunicação com microserviço de produção'
      )
    })
  })

  describe('getProductById', () => {
    it('should return product when found in first category', async () => {
      const mockProduct: Product = {
        id: 'product-1',
        name: 'X-Burger',
        description: 'Delicious burger',
        price: 15.99,
        category: 'Lanche'
      }

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ products: [mockProduct] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const result = await service.getProductById('product-1')

      expect(result).toEqual(mockProduct)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3335/products/Lanche'
      )
    })

    it('should return product when found in second category', async () => {
      const mockProduct: Product = {
        id: 'product-1',
        name: 'Fries',
        description: 'Delicious fries',
        price: 8.99,
        category: 'Acompanhamento'
      }

      const firstResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ products: [] })
      }

      const secondResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ products: [mockProduct] })
      }

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(firstResponse)
        .mockResolvedValueOnce(secondResponse)

      const result = await service.getProductById('product-1')

      expect(result).toEqual(mockProduct)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should throw HttpException when product is not found in any category', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ products: [] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(service.getProductById('non-existent')).rejects.toThrow(
        HttpException
      )
      await expect(service.getProductById('non-existent')).rejects.toThrow(
        'Produto não encontrado'
      )
    })

    it('should throw HttpException when API call fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(service.getProductById('product-1')).rejects.toThrow(
        HttpException
      )
      await expect(service.getProductById('product-1')).rejects.toThrow(
        'Erro de comunicação com microserviço de produção'
      )
    })
  })

  describe('notifyPaymentService', () => {
    it('should successfully notify payment service', async () => {
      const mockResponse = {
        ok: true
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(
        service.notifyPaymentService('order-1', 'approved')
      ).resolves.not.toThrow()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3334/webhooks/mercado-pago',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: 'order-1',
            paymentStatus: 'approved'
          })
        }
      )
    })

    it('should throw HttpException when notification fails', async () => {
      const mockResponse = {
        ok: false
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(
        service.notifyPaymentService('order-1', 'approved')
      ).rejects.toThrow(HttpException)
      await expect(
        service.notifyPaymentService('order-1', 'approved')
      ).rejects.toThrow('Erro ao notificar microserviço de pagamento')
    })

    it('should throw HttpException when fetch throws an error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(
        service.notifyPaymentService('order-1', 'approved')
      ).rejects.toThrow(HttpException)
      await expect(
        service.notifyPaymentService('order-1', 'approved')
      ).rejects.toThrow('Erro de comunicação com microserviço de pagamento')
    })
  })

  describe('updateOrderStatus', () => {
    it('should successfully update order status', async () => {
      const mockResponse = {
        ok: true
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(service.updateOrderStatus('order-1')).resolves.not.toThrow()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3334/checkout/order-1/start-preparation',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should throw HttpException when update fails', async () => {
      const mockResponse = {
        ok: false
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      await expect(service.updateOrderStatus('order-1')).rejects.toThrow(
        HttpException
      )
      await expect(service.updateOrderStatus('order-1')).rejects.toThrow(
        'Erro ao atualizar status do pedido'
      )
    })

    it('should throw HttpException when fetch throws an error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(service.updateOrderStatus('order-1')).rejects.toThrow(
        HttpException
      )
      await expect(service.updateOrderStatus('order-1')).rejects.toThrow(
        'Erro de comunicação com microserviço de pagamento'
      )
    })
  })
})
