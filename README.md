# Test Project

A React TypeScript application with drag-and-drop functionality for managing topics, subtopics, and questions.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js) or **yarn**

## 🚀 Step-by-Step Setup Instructions

### Step 1: Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/RonakSingh2006/Test.git
cd Test
```

### Step 2: Navigate to the Frontend Directory

```bash
cd Frontend
```

### Step 3: Install Dependencies

Install all required packages by running:

```bash
npm install
```

**OR** if you prefer yarn:

```bash
yarn install
```

This will install all dependencies listed in `package.json`, including:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- DND Kit (drag-and-drop)
- Zustand (state management)
- Axios

### Step 4: Start the Development Server

Run the development server:

```bash
npm run dev
```

**OR** with yarn:

```bash
yarn dev
```

The application will start and you should see output similar to:

```
VITE v7.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open in Browser

Open your web browser and navigate to:

```
http://localhost:5173/
```

You should now see the application running!

## 🛠️ Available Scripts

In the `Frontend` directory, you can run:

### `npm run dev`

Runs the app in development mode with hot module replacement (HMR).

### `npm run build`

Builds the app for production to the `dist` folder.

- TypeScript compilation is performed first
- Vite optimizes the build for best performance

### `npm run preview`

Preview the production build locally before deploying.

### `npm run lint`

Runs ESLint to check code quality and find problems.

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/        # React components
│   │   ├── common/       # Reusable components (Icons, DragHandle, EditForm)
│   │   ├── Question.tsx  # Question component
│   │   ├── SubTopic.tsx  # SubTopic component
│   │   └── Topic.tsx     # Topic component
│   ├── store/            # State management (Zustand)
│   │   └── QuestionStore.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Technologies Used

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DND Kit** - Modern drag-and-drop toolkit
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **ESLint** - Code linting

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port.

### Dependencies Installation Issues

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

### Build Errors

- Ensure you're using Node.js version 18 or higher
- Check that all dependencies are properly installed
- Run `npm run lint` to check for code issues

## 📝 Notes

- The development server includes Hot Module Replacement (HMR) for instant updates
- Make sure to run commands from the `Frontend` directory
- For production deployment, use `npm run build` and deploy the `dist` folder

## 💡 Next Steps

After setup, you can:

1. Explore the components in `src/components/`
2. Modify the state management in `src/store/QuestionStore.ts`
3. Customize styling in `index.css` or component files
4. Add new features or components as needed
