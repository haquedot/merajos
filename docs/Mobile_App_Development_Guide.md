# Orbit Mobile --- React Native CLI Development & Modular Architecture Guide

This document provides a comprehensive technical guide and architectural blueprint for developing a high-performance, offline-first mobile application using **React Native CLI** with a **Standard Modular (Feature-Driven) Folder Structure**.

---

## Table of Contents
1. [Prerequisites & Environment Setup](#1-prerequisites--environment-setup)
2. [Project Initialization](#2-project-initialization)
3. [Standard Modular Directory Structure](#3-standard-modular-directory-structure)
4. [Core Tech Stack & Recommended Libraries](#4-core-tech-stack--recommended-libraries)
5. [Architectural Layers Breakdown](#5-architectural-layers-breakdown)
6. [Offline-First Storage Strategy (MMKV / SQLite)](#6-offline-first-storage-strategy)
7. [Navigation Architecture](#7-navigation-architecture)
8. [Sample Code Snippets & Setup](#8-sample-code-snippets--setup)
9. [Build & Release Strategy](#9-build--release-strategy)

---

## 1. Prerequisites & Environment Setup

Before initializing the React Native CLI project, ensure your development environment has the required dependencies installed for both Android and iOS development:

- **Node.js**: v18+ LTS
- **Package Manager**: `yarn` or `pnpm`
- **JDK**: Java Development Kit 17 (zulu17)
- **Android Studio**: Android SDK, Android SDK Platform, Android Virtual Device (Emulator)
- **Xcode (macOS only)**: Xcode 15+, Command Line Tools, CocoaPods (`sudo gem install cocoapods`)
- **React Native CLI**: Recommended via `npx` (avoid global installation)

---

## 2. Project Initialization

Run the following command to create a new React Native CLI application with TypeScript template:

```bash
# Create React Native app with TypeScript template
npx @react-native-community/cli@latest init OrbitMobile --template react-native-template-typescript

# Navigate to project
cd OrbitMobile

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

---

## 3. Standard Modular Directory Structure

A **Feature-Driven (Modular) Architecture** scales effortlessly by grouping files by feature domain rather than technical type. Each feature is self-contained with its own screens, components, hooks, and services.

```
OrbitMobile/
├── android/                        # Native Android codebase
├── ios/                            # Native iOS codebase
├── assets/                         # Static assets (fonts, images, icons)
│   ├── fonts/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/                        # App entry point, providers & root navigation
│   │   ├── navigation/             # Navigation stacks & tab bar configuration
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainTabNavigator.tsx
│   │   │   └── types.ts
│   │   ├── providers/              # Context providers (Theme, Auth, QueryClient)
│   │   │   └── AppProvider.tsx
│   │   └── App.tsx                 # Root React component
│   │
│   ├── components/                 # Global shared UI components (Atomic design)
│   │   ├── ui/                     # Basic UI building blocks
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Skeleton.tsx
│   │   └── feedback/               # Modals, Toast notifications, Loaders
│   │       ├── ConfirmDeleteModal.tsx
│   │       └── Toast.tsx
│   │
│   ├── features/                   # Self-contained Domain Modules
│   │   ├── auth/                   # Authentication Feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   ├── services/
│   │   │   └── authStore.ts
│   │   │
│   │   ├── tasks/                  # Task & Time Engine Feature
│   │   │   ├── components/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskFilterBar.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTasks.ts
│   │   │   ├── screens/
│   │   │   │   ├── TaskListScreen.tsx
│   │   │   │   └── TaskDetailScreen.tsx
│   │   │   └── taskStore.ts
│   │   │
│   │   ├── research/               # Multi-Project Research Feature
│   │   │   ├── components/
│   │   │   │   ├── PaperCard.tsx
│   │   │   │   └── SectionTab.tsx
│   │   │   ├── screens/
│   │   │   │   ├── ProjectListScreen.tsx
│   │   │   │   └── ProjectDetailScreen.tsx
│   │   │   └── researchStore.ts
│   │   │
│   │   ├── career/                 # Career & DSA Tracker Feature
│   │   ├── habits/                 # Habit Tracker Feature
│   │   └── analytics/              # Productivity Analytics Feature
│   │
│   ├── services/                   # Global APIs & Native Storage Services
│   │   ├── api/                    # Axios / Fetch client instance & interceptors
│   │   │   ├── apiClient.ts
│   │   │   └── endpoints.ts
│   │   ├── storage/                # MMKV / SQLite native storage wrapper
│   │   │   └── storageService.ts
│   │   ├── google/                 # Google OAuth & Calendar/Tasks REST API
│   │   │   ├── googleAuthService.ts
│   │   │   └── googleCalendarService.ts
│   │   └── sync/                   # Offline sync background engine
│   │       └── syncEngine.ts
│   │
│   ├── theme/                      # Global Design Tokens & Typography
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # Helper utility functions & formatters
│   │   ├── dateUtils.ts
│   │   ├── stringUtils.ts
│   │   └── validators.ts
│   │
│   └── types/                      # Global TypeScript definitions
│       ├── index.ts
│       ├── task.ts
│       └── research.ts
│
├── .eslintrc.js
├── babel.config.js
├── metro.config.js
├── react-native.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Core Tech Stack & Recommended Libraries

| Functionality | Recommended Library | Purpose |
| :--- | :--- | :--- |
| **Navigation** | `@react-navigation/native` & `@react-navigation/native-stack` & `@react-navigation/bottom-tabs` | Native screen transitions & tab bar |
| **State Management** | `zustand` | Lightweight, unopinionated reactive store |
| **Offline Storage** | `react-native-mmkv` OR `@realm/react` / `watermelondb` | High-speed native key-value storage (10x faster than AsyncStore) |
| **Google Auth** | `@react-native-google-signin/google-signin` | Native OAuth 2.0 flow for Google Calendar/Tasks APIs |
| **Animations** | `react-native-reanimated` | 60fps UI animations running on native thread |
| **Gestures** | `react-native-gesture-handler` | Native touch & gesture handling |
| **Icons** | `lucide-react-native` & `react-native-svg` | Scalable vector icons |
| **HTTP Client** | `axios` & `@tanstack/react-query` | API requests & server-state caching |
| **Form Management** | `react-hook-form` & `zod` | High-performance form validation |

---

## 5. Architectural Layers Breakdown

### A. Presentation Layer (`src/features/*/screens` & `src/components/ui`)
- **UI Components**: Dumb presentation components. Do not make network calls directly; receive data via props.
- **Screens**: Smart container components. Connect to feature stores/hooks and pass data down to components.

### B. Business Logic Layer (`src/features/*/hooks` & stores)
- **Stores (Zustand)**: Manages local reactive state and syncs with MMKV storage.
- **Custom Hooks**: Encapsulate reusable domain logic (e.g., `useTasks`, `useSync`).

### C. Data & Infrastructure Layer (`src/services/`)
- **API Client**: Handles HTTP requests, JWT token refreshes, and network error handling.
- **Offline Storage (`storageService`)**: Provides synchronous fast key-value persistence.
- **Sync Engine**: Manages background mutation queues for offline actions.

---

## 6. Offline-First Storage Strategy

On React Native, **MMKV** (`react-native-mmkv`) replaces browser IndexedDB to deliver instant <1ms synchronous disk access.

### MMKV Storage Setup (`src/services/storage/storageService.ts`)

```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'orbit-user-storage',
  encryptionKey: 'secure-orbit-key', // Optional encryption
});

export const storageService = {
  setItem: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },
  getItem: <T>(key: string): T | null => {
    const json = storage.getString(key);
    return json ? JSON.parse(json) : null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clearAll: () => {
    storage.clearAll();
  },
};
```

---

## 7. Navigation Architecture

Use **React Navigation v6/v7** with typed Stack and Tab Navigators.

### Navigation Types (`src/app/navigation/types.ts`)

```typescript
import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Research: undefined;
  Career: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TaskDetail: { taskId: string };
  ResearchProjectDetail: { projectId: string };
};
```

---

## 8. Sample Code Snippets & Setup

### A. Modular Zustand Feature Store (`src/features/tasks/taskStore.ts`)

```typescript
import { create } from 'zustand';
import { storageService } from '../../services/storage/storageService';
import { Task } from '../../types/task';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
}

const STORAGE_KEY = 'orbit_tasks_data';

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  loadTasks: () => {
    const cachedTasks = storageService.getItem<Task[]>(STORAGE_KEY);
    if (cachedTasks) {
      set({ tasks: cachedTasks });
    }
  },

  addTask: (newTaskData) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now().toString(),
      status: 'todo',
    };
    const updated = [newTask, ...get().tasks];
    set({ tasks: updated });
    storageService.setItem(STORAGE_KEY, updated);
  },

  toggleTask: (id) => {
    const updated = get().tasks.map((t) =>
      t.id === id
        ? { ...t, status: t.status === 'completed' ? ('todo' as const) : ('completed' as const) }
        : t
    );
    set({ tasks: updated });
    storageService.setItem(STORAGE_KEY, updated);
  },
}));
```

### B. Feature Screen Example (`src/features/tasks/screens/TaskListScreen.tsx`)

```typescript
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTaskStore } from '../taskStore';
import { TaskCard } from '../components/TaskCard';
import { colors } from '../../../theme/colors';

export const TaskListScreen = () => {
  const { tasks, loadTasks, toggleTask } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggle={() => toggleTask(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
});
```

---

## 9. Build & Release Strategy

### Android Production Build
```bash
# Generate Release Android App Bundle (AAB)
cd android
./gradlew bundleRelease

# Output bundle path:
# android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Production Build (macOS only)
1. Open `ios/OrbitMobile.xcworkspace` in Xcode.
2. Select target device: **Any iOS Device (arm64)**.
3. Select **Product → Archive**.
4. Distribute via **App Store Connect** / **TestFlight**.

---

### Best Practices Checklist
- [x] **Modular Structure**: Keep features strictly separated in `src/features/`.
- [x] **No Inline Styles**: Use `StyleSheet.create` or themed style factories.
- [x] **Fast Native Storage**: Use MMKV over AsyncStorage for key-value persistence.
- [x] **TypeScript Strict**: Enable `"strict": true` in `tsconfig.json`.
- [x] **Native Performance**: Use `React.memo` and `useCallback` for expensive list item renders.
