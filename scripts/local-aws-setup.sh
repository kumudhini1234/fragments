#!/bin/sh

# Setup AWS environment variables
echo "Setting AWS environment variables for LocalStack"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

# Wait for LocalStack S3 to be ready
echo 'Waiting for LocalStack S3...'
until (curl --silent http://localhost:4566/_localstack/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
    sleep 5
done
echo 'LocalStack S3 Ready'

# Create S3 bucket if it doesn't exist
if ! aws --endpoint-url=http://localhost:4566 s3api head-bucket --bucket fragments 2>/dev/null; then
    echo "Creating LocalStack S3 bucket: fragments"
    aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments
else
    echo "S3 bucket 'fragments' already exists."
fi

# Check if DynamoDB table exists before attempting to create
if ! aws --endpoint-url=http://localhost:8000 dynamodb describe-table --table-name fragments 2>/dev/null; then
    echo "Creating DynamoDB-Local DynamoDB table: fragments"
    aws --endpoint-url=http://localhost:8000 \
    dynamodb create-table \
        --table-name fragments \
        --attribute-definitions \
            AttributeName=ownerId,AttributeType=S \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=ownerId,KeyType=HASH \
            AttributeName=id,KeyType=RANGE \
        --provisioned-throughput \
            ReadCapacityUnits=10,WriteCapacityUnits=5

    # Wait until the Fragments table exists in dynamodb-local
    aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
else
    echo "DynamoDB table 'fragments' already exists."
fi
