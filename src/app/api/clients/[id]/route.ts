import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.platform !== undefined) updateData.platform = body.platform;
    if (body.defaultFeeRate !== undefined) updateData.defaultFeeRate = parseFloat(body.defaultFeeRate) || 0;

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Client PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (error: any) {
    console.error("Client DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete client" }, { status: 500 });
  }
}
