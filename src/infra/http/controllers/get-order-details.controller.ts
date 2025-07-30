import { GetOrderByIdUseCase } from '@/domain/fastfood/application/use-cases/get-order-by-id'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'

@ApiTags('Pedidos')
@Controller('/orders')
export class GetOrderDetailsController {
  constructor(
    private getOrderById: GetOrderByIdUseCase,
    private microserviceCommunication: MicroserviceCommunicationService
  ) {}

  @Get('/:id/details')
  @ApiOperation({
    summary: 'Obter detalhes completos de um pedido (para montar o pedido)'
  })
  async handle(@Param('id') id: string) {
    const result = await this.getOrderById.execute({ id })

    if (result.isLeft()) {
      throw new Error('Pedido não encontrado')
    }

    const order = result.value.order

    // Buscar informações do cliente
    const customer = await this.microserviceCommunication.getCustomerByCpf(
      order.customerId.toString()
    )

    // Buscar informações dos produtos
    const productIds = order.products
      .getItems()
      .map((product) => product.productId.toString())

    const products = await Promise.all(
      productIds.map((productId) =>
        this.microserviceCommunication.getProductById(productId)
      )
    )

    return {
      order: {
        id: order.id.toString(),
        customerId: order.customerId.toString(),
        status: order.status?.getValue(),
        paymentStatus: order.paymentStatus?.getValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf
      },
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category
      }))
    }
  }
}
