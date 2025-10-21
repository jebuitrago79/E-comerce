import pytest
import httpx

SUPABASE_URL = "https://aqdwhapdvikqzgeodneu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZHdoYXBkdmlrcXpnZW9kbmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5ODYwOTEsImV4cCI6MjA3NjU2MjA5MX0.fPnIdRxejZW-lDcgYWC9GX9aMKktyFloMDmdA5Fouj8"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}


@pytest.mark.asyncio
async def test_supabase_connection():
    """Prueba la conexión a la tabla player_images en Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/player_images?sofifa_id=eq.2147&select=*"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=HEADERS)

    # Verifica código de estado
    assert response.status_code == 200, f"❌ Código inesperado: {response.status_code}"

    data = response.json()

    # Verifica que la respuesta sea una lista (como debe devolver Supabase)
    assert isinstance(data, list), f"❌ El resultado no es una lista: {type(data)}"

    # Verifica que haya al menos un resultado
    assert len(data) > 0, "❌ No se encontró ningún registro con ese sofifa_id"

    # Opcional: muestra salida legible solo si el test pasa
    print("✅ Conexión exitosa con Supabase")
    print("🔍 Resultado:", data[0])

