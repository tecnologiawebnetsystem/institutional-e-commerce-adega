import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  try {
    const { cep } = await params;
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: "CEP invalido" }, { status: 400 });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return NextResponse.json({ error: "CEP nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      complement: data.complemento,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar CEP" }, { status: 500 });
  }
}
