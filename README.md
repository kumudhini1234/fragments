# fragments
Lab 1

# Project Title - Fragments




---

## Prerequisites

Before running any of the scripts or starting the project, make sure to install the following dependencies:

1. **Node.js**: Version 16 or above is recommended. To check your Node version:
   ```bash
   node -v

2. **npm**: This should be installed automatically with Node.js. Check if it's installed:
   ```bash
   npm -v
  
3. **Install Project Dependencies**: Install the project dependencies by running the following command:
    ```bash
    npm install

4. **Lint the project**: The lint script runs ESLint to check the JavaScript code for any style or syntax issues. This ensures your code follows best practices and adheres to your project’s coding standards.
    ```bash
    npm run lint

5. **Start the project**: The start script will run your project normally without any automatic reloading or debugging. This is used when you're ready to run the application in production.
    ```bash
    npm start

6. **Run the Project in Development Mode**: The dev script runs your project using nodemon, which automatically restarts your server when there are changes to any files in the src directory. This is useful for local development and quick iterations.
    ```bash
    npm run dev

7. **Run the Project in Debug Mode**: The debug script is similar to dev, but it also starts the Node.js inspector on port 9229. This allows you to attach a debugger (like VSCode) to inspect variables and set breakpoints in your code.
    ```bash
    npm run debug

