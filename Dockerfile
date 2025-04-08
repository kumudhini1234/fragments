# Stage 1: Build dependencies in a temporary container
FROM node:20-alpine AS builder

LABEL maintainer="Kumudhini Reddicherla <kreddicherla@myseneca.ca>"
LABEL description="Fragments node.js microservice"

ENV PORT=8080 \
    NODE_ENV=dev \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=dev

RUN npm install

COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Stage 2: Create a minimal production image
FROM node:20-alpine

ENV PORT=8080 \
    NODE_ENV=dev

WORKDIR /app



# ✅ Install aws-cli with version pinning
RUN apk add --no-cache curl=8.12.1-r1 aws-cli=2.22.10-r0

COPY --from=builder /app .

EXPOSE 8080

# ✅ Use JSON array format for CMD
CMD ["sh", "-c", \
  "echo 'Waiting for AWS services to be ready...' && \
  sleep 30 && \
  echo 'Setting up local AWS resources...' && \
  aws --endpoint-url=http://dynamodb-local:8000 dynamodb create-table \
    --table-name fragments \
    --attribute-definitions AttributeName=ownerId,AttributeType=S AttributeName=id,AttributeType=S \
    --key-schema AttributeName=ownerId,KeyType=HASH AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST && \
  aws --endpoint-url=http://localstack:4566 s3api create-bucket --bucket kreddicherla-fragments && \
  echo 'All set. Starting app now...' && \
  npm start"]   