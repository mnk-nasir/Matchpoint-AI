# 🏛️ MATCHPoint AI — System Architecture

<div align="center">
<em>Modern AI-assisted startup evaluation platform — Architecture Reference 2026</em>
</div>

---

## 🔭 High-Level System Overview

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#0d9488', 'primaryTextColor': '#f0fdfa', 'primaryBorderColor': '#14b8a6', 'lineColor': '#5eead4', 'secondaryColor': '#1e1b4b', 'tertiaryColor': '#0f172a', 'background': '#020617', 'mainBkg': '#0f172a', 'nodeBorder': '#14b8a6', 'clusterBkg': '#0f172a80', 'clusterBorder': '#334155', 'titleColor': '#f0fdfa', 'edgeLabelBackground': '#0f172a', 'nodeTextColor': '#f0fdfa' }}}%%
graph TB
    subgraph INTERNET["☁️  INTERNET"]
        USER["👤 User / Investor / Founder"]
    end

    subgraph CDN["🌍  CDN  ·  Edge Layer"]
        VITE["⚡ Vite Dev Server\n:5173"]
    end

    subgraph SPA["⚛️  FRONTEND  ·  React 18 SPA"]
        direction LR
        ROUTER["🧭 Router\nReact Router v6"]
        PAGES["📄 Pages\n13 Routes"]
        COMPS["🧩 Components\n8 Modules"]
        SRVS["🔌 Services\n11 API Clients"]
        FEAT["⚙ Features\n3 Feature Packs"]
    end

    subgraph API["🐍  BACKEND  ·  Django REST Framework"]
        direction LR
        VIEWS["🎯 Views\n7 View Modules"]
        SERIAL["📋 Serializers\n5 Schemas"]
        BIZ["🧠 Services\n3 Engines"]
        REPO["📦 Repos\n2 Repositories"]
        MODELS["🏗 Models\n4 Domains"]
    end

    subgraph AI["🤖  AI  ·  LLM Gateway"]
        direction LR
        OPENAI["OpenAI\nGPT-4o"]
        GEMINI["Google\nGemini 2.0"]
    end

    subgraph DATA["🗄️  DATA  ·  Persistence"]
        MYSQL[("MySQL\n(Production DB)")]
    end

    USER -->|HTTPS| VITE
    VITE --> ROUTER
    ROUTER --> PAGES
    PAGES --> COMPS
    PAGES --> SRVS
    COMPS --> SRVS
    FEAT --> SRVS
    SRVS -->|REST + SSE\n:8000/api/v1| VIEWS
    VIEWS --> SERIAL
    VIEWS --> BIZ
    BIZ --> REPO
    BIZ -->|"Streaming API"| OPENAI
    BIZ -->|"Fallback API"| GEMINI
    REPO --> MODELS
    MODELS --> MYSQL

    style INTERNET fill:#020617,stroke:#334155,color:#94a3b8
    style CDN fill:#0c0a09,stroke:#14b8a6,color:#5eead4
    style SPA fill:#0f172a,stroke:#6366f1,color:#a5b4fc
    style API fill:#0f172a,stroke:#0d9488,color:#5eead4
    style AI fill:#1e1b4b,stroke:#8b5cf6,color:#c4b5fd
    style DATA fill:#0c0a09,stroke:#0d9488,color:#5eead4
```

---

## ⚛️ Frontend Deep Dive

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#6366f1', 'primaryTextColor': '#e0e7ff', 'primaryBorderColor': '#818cf8', 'lineColor': '#a5b4fc', 'secondaryColor': '#1e1b4b', 'tertiaryColor': '#0f172a', 'background': '#020617', 'mainBkg': '#1e1b4b', 'nodeBorder': '#818cf8', 'clusterBkg': '#0f172a80', 'clusterBorder': '#334155', 'nodeTextColor': '#e0e7ff' }}}%%
graph TD
    subgraph PAGES["📄  Pages  ·  13 Routes"]
        P1["🏠 Landing"]
        P2["💰 Funding App"]
        P3["ℹ️ About · Pricing · FAQs"]
        P4["🚀 Startups & Companies"]
        P5["📊 Investor Dashboard"]
        P6["💼 Deals · Watchlist · Meetings"]
        P7["💬 AI Chatbot"]
        P8["🔍 Company Detail"]
        P9["🔐 Admin Panel"]
    end

    subgraph COMPONENTS["🧩  Components"]
        C1["layout/ → Navbar · Footer"]
        C2["investor/ → Layout · Sidebar · Chat UI"]
        C3["form/ → Multi-step Form Wizard"]
        C4["ui/ → Cards · Modals · Loaders"]
        C5["pdf/ → Report PDF Export"]
        C6["sections/ → Hero · CTA Blocks"]
    end

    subgraph SERVICES["🔌  Service Layer  ·  TypeScript"]
        S0["api.ts → Axios Instance + Interceptors"]
        S1["auth.ts → JWT Login · Register"]
        S2["evaluation.ts → Submit · List · Detail"]
        S3["chatService.js → SSE Stream Reader"]
        S4["ai.ts → Narrative Generation"]
        S5["investor.ts · watchlist.ts · leads.ts"]
        S6["analytics.ts · adminInvestors.ts · user.ts"]
    end

    subgraph FEATURES["⚙️  Feature Modules"]
        F1["deal-report/ → Full Report Builder"]
        F2["accelerators/ → Program Matching"]
        F3["investors/ → Investor Portal"]
    end

    PAGES --> COMPONENTS
    PAGES --> SERVICES
    COMPONENTS --> SERVICES
    FEATURES --> SERVICES
    SERVICES --> S0

    style PAGES fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
    style COMPONENTS fill:#172554,stroke:#60a5fa,color:#bfdbfe
    style SERVICES fill:#0f172a,stroke:#14b8a6,color:#5eead4
    style FEATURES fill:#1a2e05,stroke:#84cc16,color:#d9f99d
```

---

## 🐍 Backend Deep Dive

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#0d9488', 'primaryTextColor': '#ccfbf1', 'primaryBorderColor': '#14b8a6', 'lineColor': '#5eead4', 'secondaryColor': '#0f172a', 'tertiaryColor': '#0c0a09', 'background': '#020617', 'mainBkg': '#0f172a', 'nodeBorder': '#14b8a6', 'clusterBkg': '#0f172a80', 'clusterBorder': '#334155', 'nodeTextColor': '#ccfbf1' }}}%%
graph TD
    subgraph VIEWS["🎯  Views  ·  API Controllers"]
        V1["auth_views → Register · Login · Me"]
        V2["evaluation_views → CRUD + Analytics"]
        V3["chat_views → Chat + SSE Stream"]
        V4["ai_views → AI Narrative"]
        V5["investor_views → Dashboard Stats"]
        V6["leads_views → Interest Capture"]
        V7["admin_investor_views → Admin CRUD"]
    end

    subgraph SERIALIZERS["📋  Serializers  ·  Validation"]
        SZ1["auth_serializers"]
        SZ2["evaluation_serializers"]
        SZ3["chat_serializers"]
        SZ4["leads_serializers"]
        SZ5["investor_admin_serializers"]
    end

    subgraph SERVICES["🧠  Services  ·  Business Logic"]
        BZ1["ai_service.py\n├─ Intent Detection\n├─ Deterministic Formatters\n└─ LLM Orchestration"]
        BZ2["scoring_engine.py\n└─ Multi-factor Scoring"]
        BZ3["startup_data_service.py\n└─ Data Aggregation"]
    end

    subgraph REPOS["📦  Repositories  ·  Data Access"]
        R1["evaluation_repository"]
        R2["leads_repository"]
    end

    subgraph MODELS["🏗️  Models  ·  Domain Entities"]
        M1["User → Custom Auth Model"]
        M2["Evaluation → Startup Assessment"]
        M3["Leads → Investor · Accelerator"]
        M4["Chat → Sessions · Messages"]
    end

    DB[("🗄️ MySQL")]

    VIEWS --> SERIALIZERS
    VIEWS --> SERVICES
    SERVICES --> REPOS
    REPOS --> MODELS
    MODELS --> DB

    style VIEWS fill:#0f172a,stroke:#f97316,color:#fed7aa
    style SERIALIZERS fill:#0f172a,stroke:#a855f7,color:#e9d5ff
    style SERVICES fill:#0f172a,stroke:#14b8a6,color:#99f6e4
    style REPOS fill:#0f172a,stroke:#3b82f6,color:#bfdbfe
    style MODELS fill:#0f172a,stroke:#eab308,color:#fef08a
```

---

## 🔄 Core Data Flows

### 💬 AI Chat — SSE Streaming Pipeline

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#6366f1', 'actorBkg': '#1e1b4b', 'actorBorder': '#818cf8', 'actorTextColor': '#e0e7ff', 'signalColor': '#5eead4', 'signalTextColor': '#f0fdfa', 'labelBoxBkgColor': '#0f172a', 'labelBoxBorderColor': '#334155', 'labelTextColor': '#94a3b8', 'loopTextColor': '#a5b4fc', 'noteBkgColor': '#1e1b4b', 'noteTextColor': '#c4b5fd', 'noteBorderColor': '#6366f1', 'activationBkgColor': '#1e293b', 'activationBorderColor': '#475569', 'sequenceNumberColor': '#14b8a6' }}}%%
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant FE as ⚛️ Frontend
    participant BE as 🎯 chat_views
    participant AI as 🧠 ai_service
    participant LLM as 🤖 OpenAI / Gemini

    U->>FE: Types question in chat
    FE->>BE: POST /investor/chat/stream
    BE->>AI: _detect_intent(question)

    alt ⚡ Deterministic Path (no LLM)
        AI-->>BE: Formatted table / list / profile
        Note over AI,BE: Zero-latency structured response
    else 🤖 LLM Path
        AI->>LLM: Prompt + startup context
        loop Token Stream
            LLM-->>AI: Token chunk
            AI-->>BE: Yield formatted chunk
        end
    end

    BE-->>FE: SSE stream (id: N per chunk)
    FE->>FE: Deduplicate by id · Reorder · Render
    FE-->>U: Rich formatted response
```

---

## 🗺️ API Endpoints

| Domain | Method | Endpoint | Description |
|:---|:---:|:---|:---|
| **🔐 Auth** | `POST` | `/auth/register/` | New user registration |
| | `POST` | `/auth/login/` | General JWT authentication |
| | `POST` | `/auth/token/refresh/` | Token refresh |
| | `GET` | `/auth/me/` | Current user profile |
| **📊 Evaluations** | `POST` | `/evaluations/create/` | Create draft |
| | `POST` | `/evaluations/submit/` | Submit + score |
| | `GET` | `/evaluations/list/` | List user evaluations |
| | `GET` | `/evaluations/<uuid>/` | Detail view |
| | `GET` | `/evaluations/analytics/summary/` | Analytics dashboard |
| **🤖 AI** | `POST` | `/ai/narrative/` | AI narrative generation |
| | `GET` | `/ai/health` | Service health check |
| **💬 Chat** | `POST` | `/investor/chat/` | Send message |
| | `POST` | `/investor/chat/stream` | SSE streaming chat |
| | `GET` | `/investor/chat/sessions` | List sessions |
| | `GET` | `/investor/chat/sessions/<uuid>` | Session history |
| **📈 Investor** | `POST` | `/auth/login/` | Investor portal login |
| | `GET` | `/investor/dashboard-stats` | KPI metrics |
| | `GET` | `/startups` | Browse startups |
| **📝 Leads** | `POST` | `/leads/investors/` | Investor interest |
| | `POST` | `/leads/accelerators/` | Accelerator interest |
| **⚙️ Admin** | `POST` | `/auth/login/` | Admin portal login |
| | `*` | `/admin/investors/` | Investor CRUD |
| | `POST` | `/admin/investors/from-lead/` | Convert lead → investor |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|:---|:---|:---:|
| **Frontend** | React + Vite | 18.x / 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **Language** | JSX + TypeScript | — |
| **Routing** | React Router | v6 |
| **Backend** | Django + DRF | 6.x / 3.16.x |
| **Python** | Python | 3.13.x |
| **Filters** | Django Filter | 25.x |
| **Auth** | SimpleJWT | 5.x |
| **AI Primary** | OpenAI GPT-4o | latest |
| **AI Fallback** | Google Gemini 2.0 | latest |
| **Database** | MySQL | latest |
| **Streaming** | Server-Sent Events | — |

---

<div align="center">
<sub>MATCHPoint AI · Architecture Reference · March 2026</sub>
</div>
