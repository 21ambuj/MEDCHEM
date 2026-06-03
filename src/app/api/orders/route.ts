import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total_price_inr } = body; 
    // In a real app we'd get user_id from the session. Hardcoding a dummy user for now if none exists.
    
    // First ensure we have at least one user to link orders to for the hackathon demo
    let user = await prisma.user.findFirst({ where: { role: 'SELLER' } });
    if (!user) {
       user = await prisma.user.create({
         data: { email: 'seller@test.com', password: 'password123', role: 'SELLER' }
       });
    }

    // Create the order and items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total_price_inr,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              ordered_quantity: item.ordered_quantity,
              ordered_unit: item.ordered_unit,
              base_quantity: item.base_quantity,
              price_inr: item.price_inr
            }))
          }
        }
      });

      // Update inventory for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory_quantity: {
              decrement: item.base_quantity
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
