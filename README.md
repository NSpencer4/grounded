# Project Grounded
![Grounded Project](./docs/grounded-project.jpg "Grounded Project")

**Status:** Proof of Concept (POC)  
**Focus:** Reliability, Robustness, and Accuracy in Agentic AI  
**Target:** AI-native Applications and Website Builders

---

## 1. Why "Grounded"?

The name **Grounded** stems from an electrical engineering metaphor designed to solve a critical problem in Generative AI: **Volatility.**

In an electrical system, a high-voltage surge (like a bolt of lightning) represents raw power and speed. Without a **Ground**, that energy is unpredictable and can damage the system. In the world of Large Language Models (LLMs), "lightning" is the AI's creative intelligence, but without architectural "grounding," that intelligence often leads to hallucinations and logic errors.

* **The Current:** The rapid, high-performance capabilities of our AI agents.
* **The Ground:** The architectural safeguards and organizational data sources that anchor the AI to reality.

**Project Grounded** is a blueprint for building customer service features that are not just "smart," but fundamentally **reliable** and **stable** enough for production-grade user experiences.

---

## 2. POC Scope & "Organizational Capabilities"

**Primary Objective:** To validate a robust, event-driven agent orchestration pattern. This POC demonstrates how AI app and website creators can integrate "agentic" workflows that are grounded in their specific business data.

**The "Monolith" Abstraction:** In the architecture, you will see a "Company Data & Actions Monolith." For this POC:
* This represents **Organizational Service Capabilities** (e.g., billing, user settings, order history).
* We are building a simulated interface to show how the **Model Context Protocol (MCP)** bridges the gap between AI agents and existing internal systems.
* This ensures the AI is grounded in real-time facts rather than static, outdated training data.

---

## 3. Architecture Overview: The State Machine Workflow

Project Grounded does not treat AI interactions as simple Request/Response cycles. Instead, it implements a **Distributed State Machine** via an event-driven loop.

### Key Patterns
* **Workflow as State Machine:** Every agent "reporting back" with an assertion or data point is treated as a state transition event. The Orchestrator records these assertions, allowing the system to track the "grounded state" of the conversation before a final decision is ever made.
* **CQRS (Command Query Responsibility Segregation):** * **Write Side:** Rails (`Conversation Commands`) + PostgreSQL. Optimized for transactional integrity.
    * **Read Side:** Rails (`Conversation Updates`) + DynamoDB. Optimized for low-latency chat history.
* **Agentic Orchestration:** Specialized AWS Lambdas (Agents) perform granular tasks (e.g., fetching data, asserting state) rather than one large, monolithic prompt.
* **Model Context Protocol (MCP):** A standardized interface that allows our AI agents to "plug into" the ground truth of our organizational services.

---

## 4. System Components

### Frontend & API Gateway
* **React / Remix:** Hosted on Cloudflare Workers for global performance and edge delivery.
* **GraphQL Gateway:** Acts as the unified entry point. It manages real-time data streaming and subscriptions to push AI replies back to the user instantly.

### Core Services (Ruby on Rails)
* **Users Service:** Manages identity and user context.
* **Conversation Commands:** The "Write" path. Receives user messages, persists them to Postgres, and triggers the Kafka event chain.
* **Conversation Updates:** The "Read" path. Serves optimized chat history and state from DynamoDB for rapid UI rendering.

### The Intelligence Layer (AWS Lambda / Kafka)
* **Orchestrator (Actions):** The state machine engine. It evaluates user intent and manages the workflow transition by triggering the correct agents.
* **Specialized Agents:** Lambdas that leverage **MCP Servers** to query organizational data.
* **Orchestrator (Assertions):** Listens for agent events. Each assertion updates the `Conversation Evaluation States` database, moving the workflow forward.
* **Decision Agent:** The final state in the machine. It synthesizes all gathered assertions to produce the final, grounded response.

---

## 5. The "Grounded" Data Flow

1.  **Ingest:** User sends a message via the UI to the **GraphQL Gateway**.
2.  **Command:** The message is saved to Postgres; a "New Message" event is published to **Kafka**.
3.  **State Transition:** The **Orchestrator** moves the state to "Evaluating" and triggers specialized agents.
4.  **Grounding & Assertion:** Agents call **MCP Servers** to retrieve facts. Each agent reports back to Kafka with an **Assertion Event**.
5.  **State Accumulation:** The **Assertions Orchestrator** records these facts into the State DB. Once all required assertions are met, it triggers the "Decision" state.
6.  **Respond:** The **Decision Agent** generates the final response based on the accumulated state.
7.  **Push:** GraphQL pushes the update back to the user via WebSocket/Stream.

---

## 6. Repository Structure
```
packages/
├── server/                        # Backend infrastructure layer
│   ├── shared/                    # Shared utilities
│   │   ├── dynamo/                # DynamoDB client wrapper
│   │   ├── postgres/              # PostgreSQL connection manager
│   │   ├── event-producer/        # Kafka producer with connection pooling
│   │   └── secrets-manager/       # AWS Secrets Manager client
│   ├── agents/                    # AI agents (placeholder)
│   │   ├── customer-spend-agent/
│   │   └── response-recommendation-agent/
│   ├── orchestrators/             # State machine orchestrators
│   │   ├── actions-orchestrator/  # Main orchestration Lambda
│   │   ├── assertions-orchestrator/
│   │   └── conversation-responder/
│   └── apis/                      # API implementations
│       ├── gateway-api/           # GraphQL API (Apollo Server v5)
│       └── organization-data-api/
├── ui/
│   └── customer-ui/               # Remix + React frontend (Cloudflare Workers)
│       ├── app/                   # Application source
│       │   ├── components/        # React components
│       │   ├── lib/               # Utilities (supabase, types)
│       │   └── routes/            # Remix routing
│       └── workers/               # Cloudflare Workers edge functions
└── schemas/                       # Shared data schemas (placeholder)

terraform/                         # AWS infrastructure-as-code
docs/                              # Architecture diagrams
```

## 7. Stretch Goals
- [x] Implement GraphQL layer
- [ ] Implement GraphQL layer
- [ ] Implement Outbox Pattern - Postgres w/ Debezium & Dynamo w/ Streams to a Lambda producer
- [ ] Implement vector DB for embedded customer information to group similar customers for Agent evaluation
- [ ] Storybook Support
- [ ] Theming engine w/ styled components
- [ ] Build Admin decision review UI
- [ ] Build Agent refund requesting - ex. Agent has a limit of $50 they can refund but they can request overage for manual approval
- [ ] Implement commit-lint, husky, conventional commit and semantic release for versioning