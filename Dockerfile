# Начало от официального образа Node.js
FROM node:latest

# Установка рабочей директории
WORKDIR /app

# Копирование файлов package.json и package-lock.json (если есть)
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода приложения
COPY . .

# Объявление порта, который будет прослушиваться приложением
EXPOSE 2023

# Install Prisma CLI
RUN npm install prisma --save-dev

# Generate Prisma Client
RUN npx prisma generate

# Сборка приложения
RUN npm run build

# Запуск приложения
CMD [ "npm", "run", "start:prod" ]

#WordsComparer:
#docker run --name=words-comparer-container --network=remote-audile-net -p 3131:33 -d dimanvaz/audile:words-comparer

#БД:
#docker run --name=postgres-container --network=remote-audile-net -e POSTGRES_PASSWORD=root -e POSTGRES_USER=postgres -e POSTGRES_DB=audileUsers -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres

#audile:
#docker run -it --name=nest-audile-container --network=remote-audile-net -p 3130:3130 dimanvaz/audile:nest-audile-0107
#docker run -it --name=nest-audile-container --network=remote-audile-net -p -name 3130:3130 nest-audile-0407

#подготовка БД:
#docker exec -it nest-audile-container npx prisma migrate deploy
#потом npx prisma db seed