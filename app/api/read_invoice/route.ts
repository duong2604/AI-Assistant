import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { invoiceFileName, invoiceFileBase64 } = await req.json();

    const invoiceSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        supplier_name: { type: "string", description: "Tên nhà cung cấp" },
        tax_code: { type: "string", description: "Mã số thuế nhà cung cấp" },
        invoice_number: { type: "string", description: "Số hóa đơn" },
        invoice_date: {
          type: "string",
          description: "Ngày lập hóa đơn (YYYY-MM-DD)",
        },
        amount: {
          type: "number",
          description: "Giá trị hàng hóa/dịch vụ chưa VAT",
        },
        vat: { type: "number", description: "Tiền thuế VAT" },
        expense_category: {
          type: "string",
          description: "Loại chi phí (Điện, Internet, Nguyên vật liệu, ...)",
        },
        total: {
          type: "number",
          description: "Tổng tiền thanh toán sau thuế",
        },
      },
      required: [
        "supplier_name",
        "tax_code",
        "invoice_number",
        "invoice_date",
        "amount",
        "vat",
        "expense_category",
        "total",
      ],
    };

    const prompt = `
    Bạn là trợ lý kế toán AI. 
    Hãy đọc nội dung hóa đơn sau và trích xuất thông tin đúng theo schema JSON bên dưới.
    Không giải thích gì thêm, chỉ trả về JSON hợp lệ.
    `;

    const events = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_file",
              filename: invoiceFileName,
              file_data: `data:application/pdf;base64,${invoiceFileBase64}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          schema: invoiceSchema,
          name: "invoice_extraction_result",
        },
      },
      stream: true,
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);

            if (event.type === "response.output_text.delta") {
              process.stdout.write(event.delta); // Hiển thị dần
            } else if (event.type === "response.completed") {
              console.log("\n✅ Done!");
            }
          }
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("Error reading invoice:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
