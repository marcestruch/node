# 1. Crea la estructura de carpetas
mkdir src

# 2. Crea un archivo .env (opcional)
echo "PORT=3000" > .env

# 3. Levanta el entorno
docker-compose up -d

# 4. Ver los logs
docker-compose logs -f app