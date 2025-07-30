import { GetOrdersByStatusUseCase } from '@/domain/fastfood/application/use-cases/get-orders-by-status'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

interface GetOrdersByStatusQuery {
  status?: string
  customerId?: string
}

@ApiTags('Pedidos')
@Controller('/orders')
export class GetOrdersByStatusController {
  constructor(private getOrdersByStatus: GetOrdersByStatusUseCase) {}

  @Get('/by-status')
  @ApiOperation({
    summary: 'Listar pedidos por status (visão do cliente)'
  })
  async handle(@Query() query: GetOrdersByStatusQuery) {
    const result = await this.getOrdersByStatus.execute({
      status: query.status,
      customerId: query.customerId
    })

    if (result.isLeft()) {
      throw new Error('Erro ao buscar pedidos')
    }

    return {
      orders: result.value.orders.map((order) => ({
        id: order.id.toString(),
        customerId: order.customerId.toString(),
        status: order.status?.getValue(),
        paymentStatus: order.paymentStatus?.getValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: order.products.getItems().map((product) => ({
          id: product.id.toString(),
          productId: product.productId.toString()
        }))
      }))
    }
  }
}
