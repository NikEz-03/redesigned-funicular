# Sarawak Digital Access (Front-End)

This is the Front-End mobile application for the **Sarawak Digital Access** platform, built with **React Native** and **Expo**.

## 📱 Prerequisites

Before you start, make sure you have the following installed:
1.  **Node.js**: [Download here](https://nodejs.org/) (LTS version recommended).
2.  **Expo Go App**: Install on your Android/iOS phone to test the app.

## 🚀 Getting Started

1.  **Clone the repository** (or unzip the project folder).
2.  **Install dependencies**:
    Open your terminal/command prompt in the project folder and run:
    ```bash
    npm install
    ```
3.  **Run the app**:
    ```bash
    npx expo start
    ```
4.  **Test on Device**:
    -   Scan the QR code shown in the terminal using the **Expo Go** app on your phone.
    -   Make sure your phone and computer are on the same Wi-Fi network.

## 📂 Project Structure

-   `App.js`: Main entry point and Navigation setup.
-   `src/screens`:
    -   `WelcomeScreen.js`: Intro animation.
    -   `HomeScreen.js`: Main news feed.
    -   `NewsDetailsScreen.js`: Article view.
    -   `DownloadsScreen.js`: Offline saved articles.
    -   `SettingsScreen.js`: App settings.
-   `src/services/mockData.js`: **IMPORTANT FOR BACK-END TEAM**. This file currently contains fake data. You will need to replace the `getNews()` function here to fetch real data from your Azure API.
-   `src/utils/storage.js`: Handles saving articles to the phone's local storage (offline mode).

## 🔧 Notes for Back-End Team

-   **API Integration**: Look at `src/screens/HomeScreen.js`. Currently, it calls `getNews()` from `mockData.js`. You should replace this with a real `fetch()` call to your Azure endpoint.
-   **Language Support**: The `SettingsScreen.js` has a language toggle state (`EN`/`MY`). You can use this state to request the correct language from your API (e.g., `GET /api/news?lang=my`).
-   **Images**: The app expects news objects to have an `imageUrl` property. Ensure your API returns full URLs for images.

## 🎨 Design

-   The app uses a custom "Premium" design system defined in `src/theme/colors.js`.
-   Please stick to these colors to maintain the brand identity.
