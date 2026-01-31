import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { AIModel, UpdateAIModelInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await query<AIModel>(
      `SELECT id, company_name, model_name, remark, is_active, created_at, updated_at 
       FROM ai_models 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching AI model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI model" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateAIModelInput;

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    if (body.company_name !== undefined) {
      updates.push(`company_name = $${paramIndex++}`);
      values.push(body.company_name);
    }
    if (body.model_name !== undefined) {
      updates.push(`model_name = $${paramIndex++}`);
      values.push(body.model_name);
    }
    if (body.remark !== undefined) {
      updates.push(`remark = $${paramIndex++}`);
      values.push(body.remark);
    }
    if (body.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(body.is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await query<AIModel>(
      `UPDATE ai_models 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING id, company_name, model_name, remark, is_active, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating AI model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update AI model" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await query(
      `DELETE FROM ai_models WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI model not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "AI model deleted" });
  } catch (error) {
    console.error("Error deleting AI model:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete AI model" },
      { status: 500 }
    );
  }
}
