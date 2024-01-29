FROM node:20-alpine3.18

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY .env .  

# Install build dependencies
RUN apk --no-cache add --virtual builds-deps \
    python3 \
    make \
    g++ \
  && yarn install --frozen-lockfile \
  && apk del builds-deps

# Copy the rest of the application code
COPY . .

# Specify the command to run on container start
CMD ["yarn", "dev"]