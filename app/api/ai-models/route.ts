import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { AIModel, CreateAIModelInput } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await query<AIModel>(
      `SELECT id, company_name, model_name, remark, is_active, created_at, updated_at 
       FROM ai_models 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI models" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateAIModelInput = await request.json();

    if (!body.company_name || !body.model_name) {
      return NextResponse.json(
        { success: false, error: "Company name and model name are required" },
        { status: 400 }
      );
    }

    const result = await query<AIModel>(
      `INSERT INTO ai_models (company_name, model_name, remark) 
       VALUES ($1, $2, $3) 
       RETURNING id, company_name, model_name, remark, is_active, created_at, updated_at`,
      [body.company_name, body.model_name, body.remark || null]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating AI model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create AI model" },
      { status: 500 }
    );
  }
}
