import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 8, // 8 horas
  path: "/",
};

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token || token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "La contrasena es obligatoria" },
        { status: 400 }
      );
    }

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json(
        { error: "Error de configuracion del servidor" },
        { status: 500 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      // Delay artificial para evitar timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Contrasena incorrecta" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      COOKIE_NAME,
      process.env.ADMIN_SECRET_TOKEN,
      COOKIE_OPTIONS
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
