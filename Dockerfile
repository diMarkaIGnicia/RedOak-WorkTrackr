# Dockerfile para entorno de desarrollo Vite + Tailwind + Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto de Vite
EXPOSE 5173

# Comando por defecto: inicia Vite y Tailwind en modo watch
CMD ["sh", "-c", "npx tailwindcss -c tailwind.config.js -i ./src/index.css -o ./src/output.css --watch & npm run dev"]
