# Coffee Shop Management System

A comprehensive coffee shop management system with POS, inventory tracking, recipe management, and real-time order queue displays for cashiers and baristas.

## 🚀 Quick Start

```bash
# Start the application
docker-compose up -d

# Access the application
open http://localhost:3000
```

## 📚 Documentation

Complete documentation is available in the `/docs` folder:

- **[User Guide](docs/USER-GUIDE.md)** - How to use the system
- **[Full README](docs/README.md)** - Complete technical documentation
- **[API Documentation](docs/API.md)** - API endpoints (coming soon)
- **[Deployment Guide](docs/CI-CD.md)** - CI/CD setup
- **[Feature Guides](docs/)** - Order implementation, variant fixes, etc.

## 📁 Project Structure

```
my-threejs-project/
├── components/          # Feature-based React components
│   ├── layout/         # Layout, Navigation
│   ├── auth/           # Authentication components
│   ├── inventory/      # Inventory management
│   ├── recipes/        # Recipe & product management
│   ├── orders/         # Order components
│   ├── analytics/      # Analytics dashboards
│   ├── pos/            # Cashier POS components
│   ├── barista/        # Barista queue components
│   └── 3d/             # Three.js 3D scene
├── pages/              # Next.js pages and API routes
├── lib/                # Utilities and services
│   ├── services/       # API service layer
│   ├── hooks/          # Custom React hooks
│   ├── api/            # API client
│   └── redux/          # Redux store
├── prisma/             # Database schema and migrations
├── scripts/            # Utility scripts
│   ├── testing/        # Test scripts
│   ├── database/       # Database utilities
│   └── utilities/      # Other utilities
├── docs/               # Documentation
├── ClaudePlan/         # Implementation roadmap
└── Documentations/     # Change logs and project state
```

## 🎯 Key Features

- **Role-based Authentication** (Admin, Manager, Barista, Cashier)
- **Cashier POS Display** - Touch-optimized order creation with payment tracking
- **Barista Queue Display** - Real-time order queue with auto-refresh
- **Inventory Management** - Stock tracking with audit logs
- **Recipe Management** - Product variants with ingredient tracking
- **Order Management** - Complete order lifecycle tracking
- **Analytics Dashboard** - Real-time sales, queue, and performance metrics
- **3D Coffee Shop Scene** - Interactive Three.js visualization

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Material-UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Docker)
- **State**: Redux Toolkit
- **Testing**: Jest, React Testing Library
- **3D Graphics**: Three.js

## 📋 Prerequisites

- Docker & Docker Compose
- Git

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
docker-compose up -d

# Run tests
npm test

# Database operations
docker-compose exec app npx prisma studio
docker-compose exec app npx prisma migrate dev
```

## 🆘 Need Help?

- Check [docs/README.md](docs/README.md) for detailed setup instructions
- Review [docs/USER-GUIDE.md](docs/USER-GUIDE.md) for usage instructions
- See [ClaudePlan/](ClaudePlan/) for development roadmap

---

**Built with ☕️ for coffee shops**
