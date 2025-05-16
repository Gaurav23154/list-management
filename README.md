# MERN Stack Application

This application allows an admin to log in, manage agents, and upload CSV lists to distribute tasks among agents.

## Features

- Admin User Login
- Agent Creation & Management
- Uploading and Distributing Lists from CSV files

## Tech Stack

- **Frontend:** React.js (or Next.js)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance (local or cloud)

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Backend Setup:**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add the following environment variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5001 # Or any port you prefer for the backend
    ```
    Replace `your_mongodb_connection_string` and `your_jwt_secret_key` with your actual values.

3.  **Frontend Setup:**
    ```bash
    cd ../client
    npm install
    ```
    If your backend is running on a port other than 5000, you might need to configure proxy settings in `client/package.json` or handle API base URLs in your frontend code.

## Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd server
    npm start
    ```
    The backend server will typically run on `http://localhost:5001` (or the port you configured).

2.  **Start the Frontend Development Server:**
    ```bash
    cd ../client
    npm start
    ```
    The frontend application will typically run on `http://localhost:3000`.

## Video Demonstration

[Link to working video demonstration] - *To be added* 