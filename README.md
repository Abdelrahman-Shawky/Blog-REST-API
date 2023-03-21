# REST-API-Blog
This is a REST API blog built with Node.js, Express, and MongoDB/Mongoose. The front-end is using a pre-built React 
template for displaying data and interacting with the back-end application.
## Getting Started
1. Clone the repository ```https://github.com/Abdelrahman-Shawky/REST-API-Blog.git```
2. Install dependencies ```npm install```
3. Set up environment variables by creating a .env file in the root directory and adding the following:
```
PORT=8080
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
```
4.Run the development server 
```npm start``` <br>
5.The server should now be running on http://localhost:8080.

## Usage
To use the application, open a web browser and navigate to http://localhost:3000/. From there, you can create an account or log in 
if you already have one. Once logged in, you can view current posts, create a new posts, edit, or delete your posts.

## Features
- Create new posts
- Edit existing posts
- Delete posts
- Websockets implementation for real-time updates
- Users can create an account, log in
- User authentication with JWT

## Technologies Used
- Node.js
- Express
- MongoDB/Mongoose
- Socket.io
- Express-validator
- Bcrypt
- Jsonwebtoken
- Dotenv

## API Endpoints

| Endpoint                     | Method | Description                                         |
| -----------------------------| ------ | ----------------------------------------------------|
| /feed/posts                   | GET    | Get all posts                                       |
| /feed/posts/:id         | GET    | Get a single post by id                             |
| /feed/posts             | POST   | Create a new post                                   |
| /feed/posts/:id         | PATCH    | Update a post by id                                |
| /feed/posts/:id         | DELETE | Delete a post by id     

## Acknowledgements
This project was built as a course project for Udemy's NodeJS - The Complete Guide by Maximilian Schwarzmüller.
