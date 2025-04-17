# Website-to-Chat

A powerful web application that transforms any website into an interactive AI chat assistant, powered by [Unbody](https://unbody.io). This project allows you to create customizable chatbots with RAG (Retrieval-Augmented Generation) capabilities that understand and respond to queries about your website content.

## Features

- 🔄 **Website Conversion**: Convert any website into a knowledge base for your chatbot
- 💬 **Customizable Chatbot**: Configure persona, tone, style, and behavior of your AI assistant
- 🧠 **RAG Pipeline**: Advanced retrieval-augmented generation for accurate, contextual responses
- 🌐 **Streaming Responses**: Real-time streaming responses with visible processing stages
- 📱 **Responsive UI**: Clean, minimal interface that works on all devices
- 🛠️ **Setup Wizard**: Step-by-step process to create and configure your chatbot
- 🎨 **Modern Design**: Built with Next.js, Tailwind CSS, and Framer Motion

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Backend**: [Unbody](https://unbody.io) for RAG capabilities and knowledge processing
- **Styling**: Tailwind CSS with custom UI components
- **Animations**: Framer Motion
- **Type Safety**: TypeScript
- **API**: Server-side API routes for chat streaming and configuration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Unbody account with admin credentials
- OpenAI API key (used by Unbody)

### Environment Setup

Create a `.env.local` file with the following variables:

```
UNBODY_ADMIN_ID=your_unbody_admin_id
UNBODY_ADMIN_SECRET=your_unbody_admin_secret
UNBODY_PROJECT_ID=your_project_id_after_setup
UNBODY_API_KEY=your_api_key_after_setup
UNBODY_CUSTOM_DATA_SOURCE_ID=your_data_source_id_after_setup
```

### Installation

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

3. Set up the Unbody project:
```bash
npm run script:setup-project
# or
yarn script:setup-project
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

- `/api/setup/create` - Creates a new chat assistant from a website URL
- `/api/setup/config/context` - Gets/updates chatbot configuration context
- `/api/setup/config/persona` - Configures chatbot persona
- `/api/setup/config/knowledge-summary` - Retrieves summary of processed website knowledge
- `/api/setup/config/update` - Updates chatbot configurations
- `/api/rag-stream` - Streams chat responses using the RAG pipeline
- `/api/sources` - Manages data sources for the chatbot
- `/api/rag-chat` - Handles chat interactions with the RAG system

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

## Usage

1. Navigate to the setup wizard at `/setup`
2. Enter the URL of the website you want to convert
3. The system will crawl the website and process its content
4. Configure the chatbot's persona, tone, and behavior
5. Start using your AI assistant to chat about the website's content

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn script:setup-project` - Set up the Unbody project (required once before first use)

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Unbody](https://unbody.io) for providing the RAG and AI capabilities
- Built with Next.js and React 19
- UI components inspired by modern design principles 