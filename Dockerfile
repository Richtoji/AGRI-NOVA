FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run prisma:generate
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:push && npm run prisma:seed && npm start"]
