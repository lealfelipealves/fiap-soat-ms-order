import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface Customer {
  id: string
  name: string
  email: string
  cpf: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

@Injectable()
export class MicroserviceCommunicationService {
  private readonly productionServiceUrl: string
  private readonly paymentServiceUrl: string

  constructor(private configService: ConfigService) {
    this.productionServiceUrl =
      this.configService.get('PRODUCTION_SERVICE_URL') ||
      'http://localhost:3335'
    this.paymentServiceUrl =
      this.configService.get('PAYMENT_SERVICE_URL') || 'http://localhost:3334'
  }

  async getCustomerByCpf(cpf: string): Promise<Customer> {
    try {
      const response = await fetch(
        `${this.productionServiceUrl}/customers/${cpf}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(
            'Cliente não encontrado',
            HttpStatus.NOT_FOUND
          )
        }
        throw new HttpException(
          'Erro ao buscar cliente',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }

      const data = await response.json()
      return data.customer
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de produção',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      // Como o microserviço de produção não tem endpoint para buscar produto por ID,
      // vamos buscar por categoria e filtrar
      const categories = ['Lanche', 'Acompanhamento', 'Bebida', 'Sobremesa']

      for (const category of categories) {
        const response = await fetch(
          `${this.productionServiceUrl}/products/${category}`
        )

        if (response.ok) {
          const data = await response.json()
          const product = data.products.find((p: Product) => p.id === productId)

          if (product) {
            return product
          }
        }
      }

      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de produção',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async notifyPaymentService(
    orderId: string,
    paymentStatus: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.paymentServiceUrl}/webhooks/mercado-pago`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            paymentStatus
          })
        }
      )

      if (!response.ok) {
        throw new HttpException(
          'Erro ao notificar microserviço de pagamento',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pagamento',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateOrderStatus(orderId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.paymentServiceUrl}/checkout/${orderId}/start-preparation`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new HttpException(
          'Erro ao atualizar status do pedido',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pagamento',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
