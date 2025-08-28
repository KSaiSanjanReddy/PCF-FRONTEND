# ViPLave Edit Works Frontend

A comprehensive facility management system built with React, TypeScript, and Tailwind CSS.

## Features

### Main Modules
- **Dashboard** - Overview and quick actions
- **Visitor Management** - Check-in/check-out, visitor registration
- **Suite Management** - Office suite management and availability
- **Bookings** - Room and suite booking system
- **Hardware Management** - IT equipment tracking and maintenance
- **Documents Management** - File organization and storage
- **Projects** - Project management and task tracking

### Settings & Configuration
- **User Info**
  - Users management
  - Roles and permissions
  - Department management
  - Employee ID system
- **Authorization** - Access control and security
- **Data Set Up**
  - Accounts configuration
  - Project settings
  - Hardware type definitions
- **Notification & Communication**
  - WhatsApp integration
  - SMS configuration
  - Message templates
- **Alert Management** - System notifications
- **Vdocipher Settings** - Video encryption
- **Wifi Settings** - Network configuration
- **Reports** - Analytics and reporting

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Top header bar
│   ├── AuthProvider.tsx # Authentication context
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── auth/           # Authentication pages
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   └── settings/       # Settings sub-pages
├── routes/             # Routing configuration
│   └── index.tsx       # Main router setup
├── config/             # Configuration files
│   └── menu.ts         # Navigation menu structure
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── lib/                # Utility functions
│   └── utils.ts        # Common utilities
└── App.tsx             # Main application component
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd viplaveditworks-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Development

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Follow Tailwind CSS utility-first approach
- Maintain consistent component structure

### Adding New Pages
1. Create the page component in `src/pages/`
2. Add the route to `src/routes/index.tsx`
3. Update the menu configuration in `src/config/menu.ts`
4. Implement the page functionality

### Authentication
The application uses a mock authentication system for development. Replace the mock implementation in `src/hooks/useAuth.ts` with your actual authentication API.

## Contributing

1. Follow the established code structure
2. Use meaningful component and variable names
3. Add proper TypeScript types
4. Include error handling
5. Test your changes thoroughly

## License

This project is proprietary software for ViPLave Edit Works.

## Support

For technical support or questions, please contact the development team.
