import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Message } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const result = await query<Message>(
      `UPDATE messages 
       SET is_favorite = TRUE, favorited_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to favorites" },
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

    const result = await query<Message>(
      `UPDATE messages 
       SET is_favorite = FALSE, favorited_at = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
