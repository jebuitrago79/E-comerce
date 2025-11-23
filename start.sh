#!/usr/bin/env bash este script es para ejecutar desdes linux debian 
#cd /ruta/a/E-comerce
#chmod +x start.sh
#./start.sh
#ejecutar esos en orden
set -e

echo "======================================"
echo "  INICIANDO E-COMMERCE (Backend + Frontend)"
echo "======================================"

# Ir siempre a la carpeta donde está este script
cd "$(dirname "$0")"

echo
echo "Iniciando BACKEND..."
# Igual que en Windows: desde la RAÍZ ejecutamos el backend
# para que el módulo 'backend.main' se encuentre bien
python -m uvicorn backend.main:app --reload &
BACKEND_PID=$!

echo "Esperando a que el backend inicie..."
sleep 5

echo
echo "Iniciando FRONTEND..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "======================================"
echo "  Proyecto iniciado. Ctrl+C para salir."
echo "======================================"

# Si matas el script, mata también los hijos
trap "echo; echo 'Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM

# Esperar a que terminen (normalmente no terminarán hasta que hagas Ctrl+C)
wait
