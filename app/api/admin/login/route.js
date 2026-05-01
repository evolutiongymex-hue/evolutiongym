export async function POST(request) {
    try {
      const body = await request.json();
      const { password } = body;
  
      if (!password) {
        return Response.json(
          { error: "La contraseña es obligatoria" },
          { status: 400 }
        );
      }
  
      const adminPassword = process.env.ADMIN_PASSWORD;
  
      if (!adminPassword) {
        return Response.json(
          { error: "Error de configuración" },
          { status: 500 }
        );
      }
  
      if (password === adminPassword) {
        return Response.json({ success: true, message: "Login exitoso" });
      } else {
        return Response.json(
          { error: "Contraseña incorrecta" },
          { status: 401 }
        );
      }
    } catch (error) {
      return Response.json(
        { error: "Error al procesar la solicitud" },
        { status: 500 }
      );
    }
  }