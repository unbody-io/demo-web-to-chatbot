# Website-to-Chat

A powerful web application that transforms any website into an interactive AI chat assistant, powered by [Unbody](https://unbody.io). This project allows you to create customizable chatbots with RAG (Retrieval-Augmented Generation) capabilities that understand and respond to queries about your website content.

## ⚠️ Important Requirements

**This project requires Unbody Cloud and is not compatible with self-hosted Unbody instances.**

### Prerequisites

1. **Unbody Cloud Account**: You must have an active [Unbody Cloud](https://app.unbody.io) account
2. **PUSH API Access**: This project uses PUSH API features which are **disabled for freemium accounts**
   - If you're on a freemium plan, please reach out to us on [Discord](https://discord.gg/6dxcHFPqQH) to request PUSH API permissions
3. **Admin API Credentials**: You need admin-level API credentials from your Unbody dashboard
4. **OpenAI Integration**: The project uses OpenAI models through Unbody (GPT-4o-mini, text-embedding-3-small)

## Features

- 🔄 **Website Conversion**: Convert any website into a knowledge base for your chatbot using web crawling
- 💬 **Customizable Chatbot**: Configure persona, tone, style, and behavior of your AI assistant
- 🧠 **RAG Pipeline**: Advanced retrieval-augmented generation for accurate, contextual responses
- 🌐 **Streaming Responses**: Real-time streaming responses with visible processing stages
- 📱 **Responsive UI**: Clean, minimal interface that works on all devices
- 🛠️ **Setup Wizard**: Step-by-step process to create and configure your chatbot
- 🎨 **Modern Design**: Built with Next.js, Tailwind CSS, and Framer Motion

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Backend**: [Unbody Cloud](https://unbody.io) for RAG capabilities and knowledge processing
- **Styling**: Tailwind CSS with custom UI components
- **Animations**: Framer Motion
- **Type Safety**: TypeScript
- **API**: Server-side API routes for chat streaming and configuration

## Getting Started

### Step 1: Obtain Unbody Admin Credentials

1. Sign up for [Unbody Cloud](https://unbody.io) if you haven't already
2. Navigate to [Admin Keys Settings](https://app.unbody.io/settings/admin-keys)
3. Generate your admin API credentials:
   - `UNBODY_ADMIN_ID`
   - `UNBODY_ADMIN_SECRET`

### Step 2: Environment Setup

Create a `.env.local` file with your admin credentials:

```env
UNBODY_ADMIN_ID=your_unbody_admin_id
UNBODY_ADMIN_SECRET=your_unbody_admin_secret
```

**Note**: The following variables will be automatically generated during project setup:
- `UNBODY_PROJECT_ID`
- `UNBODY_API_KEY`
- `UNBODY_CUSTOM_DATA_SOURCE_ID`

### Step 3: Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/website-to-chat.git
cd website-to-chat
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

### Step 4: Project Setup

Run the setup script to create your Unbody project and configure the necessary resources:

```bash
npm run script:setup-project
# or
yarn script:setup-project
```

This script will:
- Create a new Unbody project with the name "website-to-chat"
- Configure AI models (GPT-4o-mini, text-embedding-3-small, Cohere reranker)
- Set up auto-enhancement features (summary, keywords, entities, topics, vision)
- Create a custom schema for chatbot configurations
- Generate a PUSH API data source for storing chatbot configs
- Create an API key for the project
- Output the required environment variables

**Important**: Copy the generated environment variables to your `.env.local` file.

### Step 5: Start Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Knowledge Base Setup

1. **Website Crawling**: Navigate to `/setup` and enter a website URL
2. **Content Processing**: The system crawls the website (max 15 pages, depth 2) and processes content through Unbody's AI pipeline
3. **Auto-Enhancement**: Content is automatically enhanced with summaries, keywords, entities, and topics
4. **Indexing**: All content is vectorized and indexed for semantic search

### Chatbot Configuration

The setup wizard allows you to configure:

- **Persona**: Core identity and role of the chatbot
- **Personality**: Tone, style, and expertise level
- **Behavior**: Response style, interaction patterns, and limitations
- **Goals**: Primary objectives of the assistant
- **Initial Questions**: Suggested conversation starters

### RAG Pipeline

The chat system uses a sophisticated RAG pipeline with:

1. **Query Understanding**: Intent analysis and query parsing
2. **Retrieval**: Semantic search across processed website content
3. **Generation**: Context-aware response generation using configured persona
4. **Streaming**: Real-time response streaming with processing visibility

## API Routes

- `/api/setup/create` - Creates a new chat assistant from a website URL (streaming)
- `/api/setup/config/*` - Configuration endpoints for chatbot settings
- `/api/rag-stream` - Streams chat responses using the RAG pipeline
- `/api/sources` - Manages data sources for the chatbot

## Project Structure

```
├── app/                # Next.js app directory with pages and API routes
├── components/         # React components
│   ├── chat/           # Chat interface components
│   ├── setup/          # Setup wizard components
│   └── ui/             # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks including RAG pipeline
├── lib/                # Utility functions and library code
│   └── unbody/         # Unbody integration and RAG pipeline
├── scripts/            # Project setup and configuration scripts
├── public/             # Static assets
└── types/              # TypeScript type definitions
```

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn script:setup-project` - Set up the Unbody project (required once before first use)

## Troubleshooting

### Common Issues

1. **"PUSH API features disabled"**: Contact Unbody support to enable PUSH API for your account
2. **"Project setup failed"**: Verify your admin credentials are correct
3. **"Website not found"**: Ensure you've completed the setup wizard and crawled a website

### Getting Help

- Join our [Discord community](https://discord.gg/6dxcHFPqQH)
- Email support for PUSH API access requests
- Check the [Unbody documentation](https://docs.unbody.io)

## License

This project is licensed under the MIT License.