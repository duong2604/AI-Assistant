import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { textContent } = await req.json();

    const invoiceSchema = {
      name: "invoice_extraction",
      schema: {
        type: "object",
        properties: {
          supplier_name: { type: "string", description: "Tên nhà cung cấp" },
          tax_code: { type: "string", description: "Mã số thuế nhà cung cấp" },
          invoice_number: { type: "string", description: "Số hóa đơn" },
          invoice_date: {
            type: "string",
            description: "Ngày lập hóa đơn YYYY-MM-DD",
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
          "invoice_number",
          "invoice_date",
          "amount",
          "total",
        ],
      },
    };

    const prompt = `
    Bạn là trợ lý kế toán AI. 
    Hãy đọc nội dung hóa đơn sau và trích xuất thông tin đúng theo schema JSON bên dưới.
    Không giải thích gì thêm, chỉ trả về JSON hợp lệ.
    
    Nội dung hóa đơn:
    ---
    ${textContent}
    ---
    `;

    // 3️⃣ Gọi OpenAI Responses API
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          schema: invoiceSchema,
        },
      },
    });

    const output = response.output_text;
    return Response.json(JSON.parse(output));
  } catch (err: any) {
    console.error("Error reading invoice:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
