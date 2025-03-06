Farmers App Project

Overview
The Farmers App is a mobile application built to manage farmer data, with offline capabilities and data synchronization with a central server when an internet connection is available. The backend is powered by a Python Flask API, and the frontend is built with React Native using Expo. The application is designed to facilitate farmer data collection and syncing, with a focus on reliable performance both online and offline.


Technology Stack
- Backend: Python 3.12.2, Flask
- Frontend: React Native (Expo ~52.0.31)
- Database: MongoDB
- Local Storage: SQLite (for offline data storage)


Features
- Sign-in: The application requires an internet connection for the initial sign-in. Once signed in, users can continue using the app offline.
- Farmer Data Collection: Users can add farmer information such as Name, National ID, Farm ID, Farm Type, Crop, and Location, both online and offline.
- Offline Support: Data is stored locally in SQLite when no internet connection is available. Once the connection is restored, the app syncs the locally saved data with the backend server.
- API: The backend exposes RESTful API endpoints for managing farmer data, which can be accessed by various user roles (Clerk and Admin). Detailed API documentation is available in the "API Documentation.pdf" file.



Project Structure
Backend
-The backend server is built using Python 3.12.2 and Flask. It serves as the API for managing farmer data and handles requests from the mobile app. All backend dependencies are listed in the requirements.txt file.


Frontend
-The mobile app is built using React Native and Expo (~52.0.31). The app communicates with the backend API to manage farmer data and also supports offline functionality with local SQLite storage.

Installation
Backend Setup
- Navigate to the /server directory.
- Install the backend dependencies using pip:
- pip install -r requirements.txt

Start the backend server by running the following command:
- python app.py

Frontend Setup
- Navigate to the /app directory.
- Install the frontend dependencies using the following command:
- npx expo install

Start the mobile app by running:
- npx expo start

API Documentation
Detailed API documentation is provided in the API Documentation.pdf file. The documentation includes information on the following:
- API Endpoints: Descriptions of all available endpoints.
- Request Methods: Information on the HTTP methods (e.g., POST, GET).
- Roles and Access Control: User roles (Clerk and Admin) and their access to different endpoints.
- Headers: The required headers for authentication and other operations.
- Form Data: The data expected from the client in the form of JSON or form data.
- Response Data: The structure of the data returned by the server.
- HTTP Status Codes: A list of possible status codes returned by the server (e.g., 200, 401, 500).

Screenshots
- Screenshots of the app are available in the /app/screenshots folder. These provide a visual overview of the app’s user interface.

Syncing Offline Data
- Offline Data: When there is no internet connection, the app saves all data (e.g., farmer details) to a local SQLite database.
- Data Syncing: Once the app detects an active internet connection, it automatically syncs the offline data with the main backend server.
- Sign-in: The initial sign-in process requires an internet connection, but after that, the user can continue using the app offline.

Notes
- Ensure that the backend server is running before starting the mobile app.