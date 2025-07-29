import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetOrderByIdUseCase } from '@/domain/fastfood/application/use-cases/get-order-by-id'

@ApiTags('Pedidos')
@Controller('/order/:id')
export class GetOrderByIdController {
  constructor(private getOrderById: GetOrderByIdUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar pedido'
  })
  async handle(@Param('id') id: string) {
    const result = await this.getOrderById.execute({
      id
    })

    if (result.isLeft()) {
      throw new ResourceNotFoundError()
    }

    const { order } = result.value

    return { order }
  }
}
