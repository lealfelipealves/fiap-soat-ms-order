import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateOrderPaymentStatusController } from './update-order-payment-status.controller'

describe('UpdateOrderPaymentStatusController', () => {
  let controller: UpdateOrderPaymentStatusController
  let mockUpdateOrderPaymentStatus: any

  beforeEach(() => {
    mockUpdateOrderPaymentStatus = {
      execute: vi.fn()
    }

    controller = new UpdateOrderPaymentStatusController(
      mockUpdateOrderPaymentStatus
    )
  })

  it('should successfully update order payment status', async () => {
    vi.mocked(mockUpdateOrderPaymentStatus.execute).mockResolvedValue({
      isRight: () => true,
      isLeft: () => false,
      value: { order: {} }
    })

    const result = await controller.handle('order-1', {
      paymentStatus: 'approved'
    })

    expect(result).toEqual({
      message: 'Status de pagamento atualizado com sucesso'
    })

    expect(mockUpdateOrderPaymentStatus.execute).toHaveBeenCalledWith({
      id: 'order-1',
      paymentStatus: 'approved'
    })
  })

  it('should throw error when order is not found', async () => {
    vi.mocked(mockUpdateOrderPaymentStatus.execute).mockResolvedValue({
      isRight: () => false,
      value: {}
    })

    await expect(
      controller.handle('non-existent', {
        paymentStatus: 'approved'
      })
    ).rejects.toThrow()
  })

  it('should handle different payment statuses', async () => {
    vi.mocked(mockUpdateOrderPaymentStatus.execute).mockResolvedValue({
      isRight: () => true,
      isLeft: () => false,
      value: { order: {} }
    })

    const result = await controller.handle('order-1', {
      paymentStatus: 'rejected'
    })

    expect(result).toEqual({
      message: 'Status de pagamento atualizado com sucesso'
    })

    expect(mockUpdateOrderPaymentStatus.execute).toHaveBeenCalledWith({
      id: 'order-1',
      paymentStatus: 'rejected'
    })
  })

  it('should handle different order IDs', async () => {
    vi.mocked(mockUpdateOrderPaymentStatus.execute).mockResolvedValue({
      isRight: () => true,
      isLeft: () => false,
      value: { order: {} }
    })

    const result = await controller.handle('order-2', {
      paymentStatus: 'pending'
    })

    expect(result).toEqual({
      message: 'Status de pagamento atualizado com sucesso'
    })

    expect(mockUpdateOrderPaymentStatus.execute).toHaveBeenCalledWith({
      id: 'order-2',
      paymentStatus: 'pending'
    })
  })
})
