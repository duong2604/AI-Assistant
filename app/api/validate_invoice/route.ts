import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { supplier, invoiceExtract } = await req.json();

    const validateInvoiceSchema = {
      type: "object",
      additionalProperties: false,
      required: ["validation_results", "overall_status"],
      properties: {
        validation_results: {
          type: "array",
          description: "Danh sách kết quả kiểm tra từng trường.",
          items: {
            type: "object",
            additionalProperties: false, // 👈 BẮT BUỘC có dòng này
            required: [
              "field",
              "supplier_value",
              "invoice_value",
              "status",
              "comment",
            ],
            properties: {
              field: {
                type: "string",
                description:
                  "Tên trường được kiểm tra, ví dụ: supplier_name, tax_code, bank_account",
              },
              supplier_value: {
                type: ["string", "null"],
                description: "Giá trị từ danh mục nhà cung cấp",
              },
              invoice_value: {
                type: ["string", "null"],
                description: "Giá trị đọc được từ hóa đơn",
              },
              status: {
                type: "string",
                enum: ["match", "mismatch", "missing", "unknown"],
                description: "Trạng thái so khớp",
              },
              comment: {
                type: "string",
                description: "Nhận xét hoặc giải thích kết quả kiểm tra",
              },
            },
          },
        },
        overall_status: {
          type: "string",
          enum: ["valid", "invalid", "partially_valid"],
          description: "Tổng kết kết quả đối chiếu hóa đơn",
        },
      },
    };

    const events = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Bạn là hệ thống kiểm tra hóa đơn. Hãy so sánh dữ liệu nhà cung cấp và dữ liệu trích xuất từ hóa đơn.",
        },
        {
          role: "user",
          content: JSON.stringify({
            supplier,
            invoiceExtract,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          schema: validateInvoiceSchema,
          name: "supplier_invoice_validation",
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
              process.stdout.write(event.delta);
            } else if (event.type === "response.completed") {
              console.log("\n Done!");
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
