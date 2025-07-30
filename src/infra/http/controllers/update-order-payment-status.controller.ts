import { UpdateOrderPaymentStatusUseCase } from '@/domain/fastfood/application/use-cases/update-order-payment-status'
import { Body, Controller, Param, Patch } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

interface UpdateOrderPaymentStatusBody {
  paymentStatus: string
}

@ApiTags('Pedidos')
@Controller('/orders/:id')
export class UpdateOrderPaymentStatusController {
  constructor(
    private updateOrderPaymentStatus: UpdateOrderPaymentStatusUseCase
  ) {}

  @Patch('/payment-status')
  @ApiOperation({
    summary:
      'Atualizar status de pagamento do pedido (comunicação entre microserviços)'
  })
  async handle(
    @Param('id') id: string,
    @Body() body: UpdateOrderPaymentStatusBody
  ) {
    const result = await this.updateOrderPaymentStatus.execute({
      id,
      paymentStatus: body.paymentStatus
    })

    if (result.isLeft()) {
      throw new Error()
    }

    return { message: 'Status de pagamento atualizado com sucesso' }
  }
}
