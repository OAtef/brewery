# Coffee Shop Inventory Management System

A modern inventory management system built for coffee shops to track orders, stock, and manage ingredients efficiently. Built with Next.js, Material-UI, Prisma, and PostgreSQL, featuring a 3D interactive coffee shop experience.

## 🚀 Features

- **Role-based Authentication** (Admin, Manager, Barista)
- **Protected Routes** - Role-based access control for sensitive pages
- **Inventory Management** - Track ingredients, stock levels, and costs
- **Standardized Units** - Dropdown selection with validated measurement units
- **Public Menu** - Customer-facing menu showing only drinks with dessert/bakery placeholders
- **3D Coffee Shop Scene** - Interactive Three.js experience (role-restricted)
- **Real-time Updates** - Live inventory tracking
- **Audit Logging** - Complete inventory change history
- **Responsive Design** - Material-UI components with authentication-aware navigation
- **Recipe Management** - Define how products are made with standardized units
- **Sales Tracking** - Transaction recording system
- **Comprehensive Testing** - Full test coverage for authentication, components, and business logic

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Material-UI (MUI)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **3D Graphics**: Three.js
- **Authentication**: bcryptjs
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (version 20.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Git](https://git-scm.com/downloads)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd coffee-shop-inventory
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@db:5432/myapp"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

### 3. Start the Application

Launch the entire stack with Docker Compose:

```bash
# Start all services in detached mode
docker-compose up -d

# Or start with logs visible
docker-compose up
```

This command will:
- 🐘 Start PostgreSQL database on port `5432`
- 🚀 Build and start the Next.js application on port `3000`
- 🔄 Run database migrations automatically
- 📦 Install all dependencies

### 4. Access the Application

- **Main Application**: http://localhost:3000
- **Inventory Management**: http://localhost:3000/inventory (Admin access required)
- **3D Scene**: http://localhost:3000/scene
- **Database**: `localhost:5432` (if you need direct access)

## 🔑 Default Login

The application includes role-based authentication. You'll need to create users through the registration process or seed the database with default users.

## 📂 Project Structure

```
├── components/          # React components
│   ├── Layout.js           # Navigation and layout
│   ├── LoginPopup.js       # Authentication modal
│   ├── InventoryManagement.js  # Main inventory interface
│   ├── AddIngredientDialog.js  # Add ingredient modal
│   ├── EditIngredientDialog.js # Edit ingredient modal
│   └── ThreeScene.js       # 3D coffee shop scene
├── pages/              # Next.js pages and API routes
│   ├── _app.js            # App wrapper with providers
│   ├── index.js           # Homepage
│   ├── scene.js           # 3D scene page
│   ├── inventory/         # Inventory pages
│   └── api/               # API endpoints
├── lib/                # Utility libraries
│   ├── prisma.js          # Database client
│   └── auth.js            # Authentication context
├── prisma/             # Database schema and migrations
├── public/             # Static assets and 3D models
└── docker-compose.yml  # Docker services configuration
```

## 🐳 Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# Restart the application
docker-compose restart app

# Rebuild and start (after code changes)
docker-compose up --build -d
```

### Database Operations

```bash
# Access database migrations
docker-compose exec app npx prisma migrate dev

# Reset database
docker-compose exec app npx prisma migrate reset

# View database with Prisma Studio
docker-compose exec app npx prisma studio
```

### Development Commands

```bash
# Enter the app container
docker-compose exec app sh

# Install new dependencies (requires rebuild)
docker-compose exec app npm install <package-name>
docker-compose up --build -d

# View container status
docker-compose ps
```

## 🔧 Development Workflow

### Making Code Changes

1. Edit files in your local directory
2. Changes are automatically reflected (hot reload enabled)
3. For dependency changes, rebuild: `docker-compose up --build -d`

### Database Schema Changes

1. Modify `prisma/schema.prisma`
2. Run migration: `docker-compose exec app npx prisma migrate dev`
3. Generate new client: `docker-compose exec app npx prisma generate`

### Adding New Dependencies

1. Add to `package.json` or use: `docker-compose exec app npm install <package>`
2. Rebuild containers: `docker-compose up --build -d`

## 🗄️ Database Models

The system includes the following data models:

- **User** - Authentication and role management
- **Ingredient** - Coffee beans, milk, syrups, etc.
- **InventoryLog** - Audit trail for stock changes
- **Product** - Coffee products offered
- **Recipe** - Product ingredient relationships
- **Sale** - Transaction records

## 🎯 API Endpoints

### Authentication
- `POST /api/auth` - Login/Register

### Ingredients
- `GET /api/ingredient` - List all ingredients
- `POST /api/ingredient` - Create ingredient
- `PUT /api/ingredient/[id]` - Update ingredient
- `DELETE /api/ingredient/[id]` - Delete ingredient

### Inventory
- `GET /api/inventory` - Get inventory status

### Users
- `GET /api/users` - List users (Admin only)
- `PUT /api/users/[id]` - Update user

## 🚨 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Check what's using the port
lsof -i :3000

# Stop the conflicting process or change port in docker-compose.yml
```

**Database connection issues:**
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

**Permission errors:**
```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER .

# Restart with clean slate
docker-compose down -v
docker-compose up -d
```

**Container build fails:**
```bash
# Clean build with no cache
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f db

# Check container status
docker-compose ps

# Inspect container
docker-compose exec app sh
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@db:5432/myapp` |
| `NEXTAUTH_SECRET` | Authentication secret key | Required |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with: `docker-compose up --build -d`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. View container logs: `docker-compose logs -f`
3. Ensure Docker and Docker Compose are properly installed
4. Verify all required ports (3000, 5432) are available

---

**Happy coding! ☕️**

## ✅ RECENT FIXES

### MUI Dependency Issue ✅ RESOLVED
- **Issue**: `deepmerge is not a function` error during build with MUI v7.x
- **Solution**: Downgraded to stable MUI v5.15.x packages  
- **Changes**: Updated to compatible versions that work with Next.js 15
  - `@mui/material`: v7.1.1 → v5.15.x
  - `@mui/icons-material`: v7.1.1 → v5.15.x
  - `@emotion/react`: v11.14.0 → v11.11.x
  - `@emotion/styled`: v11.14.0 → v11.11.x

### SSR Router Issues ✅ RESOLVED
- **Issue**: `NextRouter was not mounted` errors during build/prerendering  
- **Solution**: Eliminated all SSR router dependencies across the application
- **Changes**: 
  - Updated auth context to use `window.location` instead of `useRouter` for logout
  - Created client-side wrapper for ProtectedRoute component
  - Added `getServerSideProps` to protected pages to disable static generation
  - **Fixed home page**: Replaced `useRouter` with `window.location` navigation
  - **Fixed LoginPopup**: Removed unused `useRouter` import
  - All pages now build successfully without SSR conflicts

### ESLint Issues ✅ RESOLVED  
- **Issue**: `react/no-unescaped-entities` errors for apostrophes
- **Solution**: Escaped apostrophes using `&apos;` HTML entity
- **Files Fixed**: `menu.js`, `ProtectedRoute.js`
