# Zywa Card Status API

## Project Overview

This project implements an internal API for Zywa to retrieve the status of a user's card by combining data from partner companies. The API provides a `/get_card_status` endpoint that accepts a user's phone number or card ID and returns the current status of the card. The data from partner companies are provided in CSV files, which are processed and stored in a PostgreSQL database.

## Tech Stack and Reasoning

- **Node.js with Express.js (TypeScript):** Chosen for its robustness and scalability in building backend services. TypeScript adds static typing, which enhances code quality and maintainability.
- **Prisma ORM:** Provides a type-safe and intuitive way to interact with the PostgreSQL database. It simplifies database migrations and schema management.
- **PostgreSQL:** A powerful and open-source relational database that integrates well with Prisma and suits the needs of this project.
- **Docker:** Used to containerize the application for consistent deployment across different environments.

## Architecture and Approach

### MVC Structure

The application follows the Model-View-Controller (MVC) architecture:

- **Models:** Defined using Prisma schema and represent the database structure.
- **Controllers:** Handle the business logic and interact with models to process requests.
- **Routes:** Define the API endpoints and handle input validation.

### Data Processing

- **CSV Data Import:** Created a script (`importData.ts`) to read CSV files from the `data` folder and import the data into the PostgreSQL database using Prisma.
- **Date Parsing:** Implemented robust date parsing to handle various date formats present in the CSV files.
- **Data Normalization:** Cleaned and normalized data during import to ensure consistency in the database.

### API Endpoint

- **Endpoint:** `/get_card_status`
- **Request Parameters:** Accepts either `phoneNumber` (9-digit number without country code) or `cardId`.
- **Response:** Returns the card's current status, timestamp of the latest event, and any relevant comments.

### Input Validation

Used `express-validator` to validate query parameters, ensuring that:

- `phoneNumber` is a 9-digit numeric string.
- `cardId` is a non-empty string.

## Setup Instructions

### Prerequisites

- **Node.js** and **npm** installed.
- **PostgreSQL** database running.
- **Docker** (optional, for containerization).

### Installation Steps

1. **Clone the Repository**

   ```bash
   cd zywa-backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

### (if you want to use your own database follow this steps(3,4,5) or else skip to 6 step)

3. **Configure Environment Variables**

   Create a `.env` file in the root directory with the following content:

   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/zywa"
   PORT=3000
   ```

4. **Set Up the Database**

   - Ensure PostgreSQL is running.
   - Create a database named `zywa`.

5. **Run Database Migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Import CSV Data**

   ```bash
   npm run importData
   ```

7. **Start the Application**

   - For development:

     ```bash
     npm run dev
     ```

   - For production:

     ```bash
     npm run build
     npm start
     ```

## Running with Docker

1. **Build the Docker Image**

   ```bash
   docker build -t zywa-backend .
   ```

2. **Run the Docker Container**

   ```bash
   docker run -p 3000:3000 --env-file .env zywa-backend
   ```

## API Usage

### Endpoint

- **GET** `/get_card_status`

### Query Parameters

- `phoneNumber` (optional): The user's 9-digit phone number.
- `cardId` (optional): The unique card identifier.

**Note:** At least one of the parameters must be provided.

### Sample Requests (based on current database url)

- **By Phone Number:**

  ```bash
  curl 'http://localhost:3000/get_card_status?phoneNumber=585949014'
  ```

- **By Card ID:**

  ```bash
  curl 'http://localhost:3000/get_card_status?cardId=ZYW8827'
  ```

### Sample Response

```json
{
  "cardId": "ZYW8827",
  "phoneNumber": "585949014",
  "status": "DELIVERED",
  "timestamp": "2023-11-13T09:34:56.000Z",
  "comment": "DELIVERED"
}
```

## Possible Improvements

- **Error Handling Middleware:** Introduce centralized error handling to manage exceptions more effectively.
- **Logging:** Integrate a logging system like Winston for better monitoring and debugging.
- **Unit and Integration Tests:** Write tests using Jest or Mocha to ensure the reliability of the application.
- **Performance Optimization:** Implement caching strategies and optimize database queries for better performance.

## Architectural Decisions

- **Choice of TypeScript:** Enhances code reliability with static typing, making it easier to catch errors during development.
- **Prisma ORM over Raw SQL:** Prisma provides a high-level API for database operations, reducing boilerplate code and improving productivity.
- **Express.js Framework:** Offers simplicity and flexibility, which is suitable for building lightweight APIs.
- **MVC Pattern:** Organizes the codebase into clear sections, making it more maintainable and scalable.
