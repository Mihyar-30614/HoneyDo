# HoneyDo

HoneyDo is an Angular & Ionic-based task management application designed to help users organize projects and todos efficiently. It leverages Firebase for authentication and data storage, and is optimized for both web and mobile platforms.

## Features
- User authentication (sign up, login)
- Project and todo management
- Responsive UI with Ionic components
- Real-time data sync with Firebase

## Project Structure
```
├── src/
│   ├── app/
│   │   ├── models/           # Data models
│   │   ├── pages/            # App pages (home, login, signup, etc.)
│   │   └── services/         # Angular services (auth, data)
│   ├── assets/               # Static assets
│   ├── environments/         # Environment configs
│   └── theme/                # SCSS theme variables
├── angular.json              # Angular CLI config
├── capacitor.config.ts       # Capacitor config for native builds
├── ionic.config.json         # Ionic project config
├── package.json              # NPM dependencies
└── tsconfig*.json            # TypeScript configs
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
1. Clone the repository:
   ```pwsh
   git clone <your-repo-url>
   cd HoneyDo
   ```
2. Install dependencies:
   ```pwsh
   npm install
   ```
3. Configure Firebase:
   - Update `src/environments/environment.ts` and `environment.prod.ts` with your Firebase project config.

### Running the App
- For web:
  ```pwsh
  ionic serve
  ```
- For Android/iOS (requires Capacitor setup):
  ```pwsh
  ionic build
  npx cap sync
  npx cap open android  # or ios
  ```

### Testing
```pwsh
ng test
```

## Environment Configuration
- `src/environments/environment.ts` — development config
- `src/environments/environment.prod.ts` — production config

## License
MIT

---

**Made with Angular, Ionic, and Firebase.**
