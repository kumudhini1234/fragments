# Fragments API Service

## Overview
Fragments is a backend service that provides authenticated users with the ability to create, retrieve, update, and delete text-based fragments. The service is built using Node.js and Express, follows RESTful API principles, and integrates with AWS for hosting and authentication using Amazon Cognito.

## Features
- **User Authentication**: Secure access using Amazon Cognito.
- **CRUD Operations**: Create, retrieve, update, and delete fragments.
- **Storage Support**: Uses AWS infrastructure for hosting.
- **GitHub Actions CI/CD**: Automated testing and linting with ESLint.

## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js (>= 18.x)
- npm (>= 9.x)
- AWS CLI (configured with appropriate IAM roles)
- Git

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/kumudhini1234/fragments.git
   cd fragments
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file with the following environment variables:
   ```sh
   AWS_REGION=<your-region>
   COGNITO_USER_POOL_ID=<your-user-pool-id>
   COGNITO_CLIENT_ID=<your-client-id>
   JWT_SECRET=<your-secret>
   ```
4. Start the server:
   ```sh
   npm start
   ```

## Running Tests
Run unit tests with:
```sh
npm test
```
Check test coverage:
```sh
npm run coverage
```

## API Endpoints
### Health Check
```http
GET /v1/health
```
Response:
```json
{
  "status": "ok"
}
```

### Retrieve Fragments
```http
GET /v1/fragments
Authorization: Bearer <access_token>
```

### Create Fragment
```http
POST /v1/fragments
Authorization: Bearer <access_token>
Content-Type: application/json
```
Request Body:
```json
{
  "data": "Sample fragment content"
}
```

### Delete Fragment
```http
DELETE /v1/fragments/:id
Authorization: Bearer <access_token>
```

## Deployment
The service is deployed on AWS EC2. To restart the service:
```sh
npm run restart
```

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature-name'`
4. Push changes: `git push origin feature-name`
5. Create a Pull Request.

## License
This project is licensed under the MIT License.
