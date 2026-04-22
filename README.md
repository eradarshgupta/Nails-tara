# Press-On Nails by Tara

A modern e-commerce platform for selling press-on nails, built with Next.js and Tailwind CSS.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 💳 Checkout process
- 📱 Responsive design
- ⚡ Fast performance with Next.js

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Language**: JavaScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
press-on-nails-by-tara/
├── app/                  # Next.js app directory
│   ├── layout.js        # Root layout
│   ├── page.js          # Home page
│   ├── admin/           # Admin pages
│   ├── checkout/        # Checkout page
│   ├── order-confirmed/ # Order confirmation page
│   └── shop/            # Shop pages
├── components/          # Reusable components
├── lib/                 # Utility functions
├── public/              # Static assets
├── tailwind.config.js   # Tailwind configuration
├── jsconfig.json        # JavaScript config
└── package.json         # Dependencies

```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Click "Deploy"

The application will be automatically deployed and updated on every push to the main branch.

## Environment Variables

If you need environment variables, create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=your_api_url_here
```

## License

All rights reserved © Tara Nails

## Support

For issues or questions, please create an issue in the repository.
