# Casanode App

Mobile application for installing and configuring a casanode node.

## Installation

### Prerequisites

- Node 22 or higher
- NPM 10 or higher
- Android Studio Koala (2024.1.1)

### Development

Clone the repository

```bash
git clone https://github.com/sentinelgrowthdao/casanode-mobile-app.git
```

Access the repository folder and navigate into the `app` folder

```bash
cd casanode-mobile-app/app
```

Install the required packages

```bash
npm i
```

Install `ionic`

```bash
npm install -g @ionic/cli
```

Generate the build information file for the application using the following command:

```bash
npm run prebuild
```

Launch the application

```bash
ionic serve
```


# Running on Android

To run the application on an Android device or emulator, follow these steps:

1. Build the Ionic project:

```bash
ionic build
```

2. Sync the Capacitor plugins and dependencies:

```bash
npx cap sync
```

3. Sync the web assets to the native Android project:

```bash
ionic capacitor copy android
````

4. Open the project in Android Studio:
```bash
ionic capacitor open android
```

5. Build and run the application in Android Studio:

- In Android Studio, click on `Build > Make Project` to ensure the project builds correctly.
- Select your target device (emulator or connected device).
- Click on the Run button (green play icon) to compile and launch the application on your selected device.

Ensure that you have the necessary Android SDK and tools installed in Android Studio to successfully build and run the project.
