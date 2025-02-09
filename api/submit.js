export async function onRequest(context) {
    if (context.request.method !== 'POST') {
        return new Response('Método no permitido', { status: 405 });
    }

    try {
        const prediction = await context.request.json();
        
        // Obtener el token de GitHub (deberás configurarlo en los secrets del repositorio)
        const token = context.env.GITHUB_TOKEN;
        
        // Crear nombre único para el archivo
        const timestamp = new Date().getTime();
        const filename = `predictions/${timestamp}.json`;

        // Preparar la solicitud a la API de GitHub
        const response = await fetch(`https://api.github.com/repos/TU_USUARIO/TU_REPO/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Nueva predicción agregada',
                content: btoa(JSON.stringify(prediction)),
                branch: 'main'
            })
        });

        if (!response.ok) {
            throw new Error('Error al guardar la predicción');
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
