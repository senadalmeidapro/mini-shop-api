export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly shippingAddress?: Record<string, string>,
  ) {}
}
