# 1) Imagen base
FROM python:3.10-slim

# 2) Crear directorio
WORKDIR /app

# 3) Copiar requirements
COPY requirements.txt .

# 4) Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# 5) Copiar el backend completo
COPY backend ./backend

# 6) Exponer puerto
EXPOSE 8000

# 7) Comando de ejecución
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
