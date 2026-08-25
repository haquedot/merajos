# Orbit --- Permanent Fix TODO Plan: Server-Side Google OAuth Token Engine & Refresh Architecture (v2.0)

> **Core Directive**: Google refresh tokens and Google API credential lifecycles belong **100% on the server**. The browser MUST NEVER handle Google refresh tokens, invoke `/refresh` endpoints, or trigger automated interactive OAuth popups.

---

## 🎯 Target Architecture Blueprint

```mermaid
graph TD
    User[User UI]
    Client[Orbit Next.js Client]
    GIS[Google GIS Code Client]
    AuthAPI[/api/auth/google/callback]
    TokenService[GoogleTokenService (Server)]
    DB[(MongoDB Atlas - Encrypted Tokens)]
    GoogleOAuth[Google OAuth 2.0 API]
    GoogleAPI[Google Calendar & Tasks APIs]
    SyncWorker[Server Sync Worker / Cron / API]

    User -->|1. Click 'Connect Google'| Client
    Client --> GIS
    GIS -->|2. Authorization Code| Client
    Client -->|3. Code + Authenticated Orbit Session| AuthAPI

    AuthAPI --> TokenService
    TokenService -->|4. Exchange code for access + refresh tokens| GoogleOAuth
    GoogleOAuth -->|5. Credentials| TokenService
    TokenService -->|6. Encrypt & Store refresh token| DB

    SyncWorker --> TokenService
    TokenService -->|7. Concurrency-Locked Token Refresh| GoogleOAuth
    TokenService -->|8. Valid Access Token| GoogleAPI

    GoogleAPI --> SyncWorker
    SyncWorker --> DB
```

---

## 🛠️ Key Architectural Principles & Security Rules

1. **Zero Google Credentials in Browser**: The browser only holds the Orbit Session. It calls Orbit endpoints (`/api/google/sync`, `/api/google/calendar`, `/api/google/tasks`). It NEVER stores or handles Google refresh tokens or raw access tokens.
2. **Session-Driven Identity (Zero Client Parameter Trust)**: Endpoints MUST NOT accept `email` or `userId` in POST payloads. User identity is derived strictly from the authenticated Orbit session (`getAuthHeaders()` / Auth Middleware).
3. **No Public `/refresh` Endpoint**: Token refresh is an internal server detail handled inside `GoogleTokenService.getValidAccessToken(userId)`.
4. **AES-256-GCM Encryption at Rest**: `refreshToken` is encrypted before saving to MongoDB and decrypted only in memory when exchanging with Google.
5. **Concurrency-Locked Token Refresh**: In-process promise locks and atomic state flags prevent multiple simultaneous sync calls from firing duplicate token refresh requests to Google.
6. **Explicit Sync State Machine**: Clear state transitions (`CONNECTED` → `SYNCING` → `REFRESHING` → `REAUTH_REQUIRED`). `REAUTH_REQUIRED` is the terminal state when user revokes access; clicking "Reconnect Google" is the **ONLY** path that launches GIS.

---

## 📋 Comprehensive TODO Implementation Plan

### Phase 1: Environment & Encryption Infrastructure Setup

- [x] **1.1 Server-Only Environment Configuration (`.env.local`)**
  - [x] Set `GOOGLE_CLIENT_ID` (Public OK).
  - [x] Set `GOOGLE_CLIENT_SECRET` (Strictly **server-only**, NEVER `NEXT_PUBLIC_*`).
  - [x] Set `GOOGLE_REDIRECT_URI` (`http://localhost:3000`, `https://orbit.merajulhaque.com`).
  - [x] Set `ENCRYPTION_SECRET` (32-byte secret key for AES-256-GCM token encryption).

- [x] **1.2 Create Encryption Utility (`lib/google/encryption.ts`)**
  - [x] Implement `encryptToken(text: string): string` using Node.js `crypto` module (AES-256-GCM with initialization vector & auth tag).
  - [x] Implement `decryptToken(encryptedText: string): string`.
  - [x] Write unit tests to verify round-trip encryption/decryption.

---

### Phase 2: MongoDB Database Model Migration

- [x] **2.1 Update User Schema (`models/User.ts`)**
  - [x] Add `google` sub-document schema:
    ```typescript
    google: {
      connected: { type: Boolean, default: false },
      googleAccountId: { type: String },
      email: { type: String },
      refreshTokenEncrypted: { type: String },
      accessTokenEncrypted: { type: String },
      accessTokenExpiresAt: { type: Date },
      scopes: [{ type: String }],
      connectedAt: { type: Date },
      lastSyncAt: { type: Date },
      syncStatus: { 
        type: String, 
        enum: ['connected', 'syncing', 'reauth_required', 'error'], 
        default: 'connected' 
      }
    }
    ```
  - [x] Add Mongoose index on `google.email` and `google.syncStatus`.

---

### Phase 3: Central `GoogleTokenService` & Concurrency Protection

- [x] **3.1 Build Core Token Service (`lib/google/googleTokenService.ts`)**
  - [x] Create `GoogleTokenService` singleton class.
  - [x] Implement `getValidAccessToken(userId: string): Promise<string>`:
    - Load user's `google` record from MongoDB.
    - If `!google.connected` or `!google.refreshTokenEncrypted`, throw `GoogleAuthRequiredError`.
    - Check if `accessToken` exists and `expiresAt > Date.now() + 5 minutes`.
    - If valid, return decrypted access token.
    - Otherwise, trigger `refreshAccessToken(userId)`.
  
- [x] **3.2 Implement Token Refresh Concurrency Locking**
  - [x] Maintain an in-memory lock map `refreshPromises: Map<string, Promise<string>>`.
  - [x] If a refresh is already in-flight for `userId`, return the existing active `Promise`.
  - [x] In `refreshAccessToken(userId)`:
    - Decrypt `refreshTokenEncrypted`.
    - Send POST request to `https://oauth2.googleapis.com/token` with `grant_type: 'refresh_token'`.
    - Handle revocation (`invalid_grant` / `400 Bad Request`): Update DB `syncStatus = 'reauth_required'`, throw `GoogleReauthRequiredError`.
    - On success: Encrypt new access token, update `accessTokenExpiresAt`, clear promise lock, and return fresh access token.

---

### Phase 4: Server-Side Authorization Code Exchange API

- [x] **4.1 Build Code Callback API (`app/api/auth/google/callback/route.ts`)**
  - [x] Create `POST /api/auth/google/callback` handler.
  - [x] Extract authenticated Orbit user session from request headers (JWT / Auth Token). Reject unauthenticated calls with `401`.
  - [x] Accept `{ code: string }` in body. **Do NOT accept `email` or `userId` from client payload**.
  - [x] Exchange `code` with Google OAuth token endpoint using `GOOGLE_CLIENT_SECRET`.
  - [x] Request `access_type: 'offline'`, `prompt: 'consent'` on authorization URL.
  - [x] Save encrypted `refreshToken` (if issued by Google) and `accessToken` to MongoDB user document.
  - [x] Set `google.connected = true`, `google.syncStatus = 'connected'`.
  - [x] Return `{ success: true, google: { connected: true, email: user.email } }`.

---

### Phase 5: Server-Side Sync Engine & Proxy Endpoints

- [x] **5.1 Refactor Calendar & Tasks API Routes**
  - [x] Create `/api/google/sync` status & proxy route (`app/api/google/sync/route.ts`).
  - [x] Server fetches `getValidAccessToken(userId)` internally and performs Google API requests server-to-server.
  - [x] Client browser invokes `/api/google/sync` without handling Google OAuth tokens directly.

- [x] **5.2 Implement Server-Side Background Engine**
  - [x] Query users with `google.connected === true` and `syncStatus !== 'reauth_required'`.
  - [x] Execute Google Tasks and Calendar sync in background even when browser tabs are closed.

---

### Phase 6: Client GIS Code Flow & Reconnect UX

- [x] **6.1 Update Client OAuth Client (`services/google/auth.service.ts`)**
  - [x] Replace `initTokenClient` with `window.google.accounts.oauth2.initCodeClient`.
  - [x] Configure `ux_mode: 'popup'` returning `codeResponse.code`.
  - [x] Post code to `POST /api/auth/google/callback`.

- [x] **6.2 Add Re-Connect Status Indicator (`components/layout/Navbar.tsx`)**
  - [x] Render state-aware UI indicator:
    - 🟢 `Google Connected`
    - 🔄 `Syncing Google Tasks...`
    - ⚡ `Google Reconnection Required` (When `syncStatus === 'reauth_required'`)
  - [x] Ensure clicking "Reconnect" is the **ONLY** trigger that launches Google GIS popup.
  - [x] Guarantee background timers, page reloads, and tab switches **NEVER launch popups**.


---

## 🧪 Comprehensive QA & Verification Matrix

### 1. OAuth Code Exchange
- [x] First-time Google connection (Refresh token issued and encrypted in MongoDB).
- [x] Subsequent connection (Preserves existing refresh token).
- [x] User cancels OAuth modal.
- [x] User revokes scopes on Google Account page.

### 2. Token Lifecycle & Concurrency
- [x] Token valid (> 5 min remaining) -> Uses cached access token.
- [x] Token expiring (< 5 min remaining) -> Server automatically refreshes via refresh token.
- [x] 5 simultaneous client sync requests -> Exactly 1 Google refresh request executed (Concurrency lock verified).
- [x] Revoked refresh token -> State transitions to `reauth_required` without throwing unhandled exceptions.

### 3. Absolute Zero-Popup Regression Test
- [x] Background timer tick -> **NO popup**
- [x] Page refresh / reload -> **NO popup**
- [x] Tab visibility change / focus -> **NO popup**
- [x] Network offline -> online reconnect -> **NO popup**
- [x] Token expiration -> **NO popup**
- [x] Server refresh failure -> **NO popup**
- [x] **ONLY explicit click on "Reconnect Google" -> Popup allowed**
