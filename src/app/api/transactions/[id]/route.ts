import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.fee !== undefined) updateData.fee = parseFloat(body.fee);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.clientId !== undefined) updateData.clientId = body.clientId || null;

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        client: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Transaction PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (error: any) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete transaction" }, { status: 500 });
  }
}
