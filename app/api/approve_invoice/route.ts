import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { invoice, validation, validationStatus, userAction, userName } =
      await req.json();

    const result = {
      workflow_id: `WF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_action: userAction,
      user_name: userName || "anonymous",
      status: userAction === "accept" ? "approved" : "rejected",
      invoice_data: invoice,
      validation: validation,
      validation_status: validationStatus,
      message:
        userAction === "accept"
          ? "Hóa đơn được duyệt thành công."
          : "Hóa đơn bị từ chối.",
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
