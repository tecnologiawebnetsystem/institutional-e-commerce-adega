import { put, del } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo nao permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Maximo 5MB." }, { status: 400 });
    }

    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url, filename: file.name, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL nao fornecida" }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Falha ao deletar" }, { status: 500 });
  }
}
