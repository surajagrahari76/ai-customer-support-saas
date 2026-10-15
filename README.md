# AI Customer Support SaaS

An AI-powered customer support platform where businesses can configure their own chatbot and embed it on any website with a single script tag.

## Features

- Secure login and logout using Scalekit authentication
- Dashboard to configure chatbot settings for your business
- AI chat API powered by Google Gemini that answers customer questions based on your settings
- Embeddable chatbot widget that works on any website
- Settings saved per user in MongoDB

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Motion
- **Authentication:** Scalekit
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini (`@google/genai`)
- **HTTP client:** Axios

## Getting Started

1. Clone the repository

```bash
   git clone https://github.com/surajagrahari76/ai-customer-support-saas.git
   cd ai-customer-support-saas
```

2. Install dependencies

```bash
   npm install
```

3. Create a `.env.local` file in the root folder and add your keys

```env
   # MONGODB_URL=
   # SCALEKIT_ENVIRONMENT_URL=
   # SCALEKIT_CLIENT_ID=
   # SCALEKIT_CLIENT_SECRET=
   # GEMINI_API_KEY=
```

4. Run the development server

```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Embed the Chatbot

Add this script to any website (replace the URL with your deployed app):

```html
<script src="https://YOUR_APP_URL/chatBot.js"></script>
```

## Project Structure

```
src/
  app/          Pages and API routes (auth, chat, settings, dashboard, embed)
  components/   UI components
  lib/          Database, session and auth helpers
  model/        Database models
public/
  chatBot.js    Embeddable chatbot widget
```

## Author

Suraj Agrahari - [GitHub](https://github.com/surajagrahari76)