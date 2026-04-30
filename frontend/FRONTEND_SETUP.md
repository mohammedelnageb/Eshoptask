# Frontend Package Configuration

## Required Dependencies

### Core Dependencies
- react: ^18.2.0 - UI library
- react-dom: ^18.2.0 - React DOM rendering
- react-router-dom: ^6.21.3 - Routing and navigation
- @reduxjs/toolkit: ^2.1.0 - State management
- react-redux: ^9.1.0 - Redux React bindings
- axios: ^1.6.5 - HTTP client
- zustand: ^4.5.0 - Alternative state management

### UI & Styling
- @mui/material: ^5.15.6 - Material UI components
- @mui/icons-material: ^5.15.6 - Material Design icons
- @emotion/react: ^11.11.3 - CSS-in-JS styling
- @emotion/styled: ^11.11.0 - Styled components

### Real-time Communication
- socket.io-client: ^4.7.4 - WebSocket client

### Development Dependencies
- typescript: ^5.3.3 - TypeScript compiler
- vite: ^5.0.12 - Build tool
- @vitejs/plugin-react: ^4.2.1 - React plugin for Vite
- eslint: ^8.56.0 - Code linting
- jest: ^29.7.0 - Testing framework
- @testing-library/react: ^14.1.2 - React testing utilities

## Installation & Development

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Opens at http://localhost:3000

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
npm run test:coverage
```

### Linting
```bash
npm run lint
```

## Environment Variables
Create `.env.local` file in frontend directory:
```
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=techshop
VITE_KEYCLOAK_CLIENT_ID=techshop-frontend
```

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── SkeletonLoader.tsx
├── pages/               # Page components
│   ├── ProductList.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderConfirmation.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Profile.tsx
│   ├── Orders.tsx
│   └── AdminDashboard.tsx
├── services/            # API & external services
│   ├── api.ts          # Axios API client with interceptors
│   └── socket.ts       # Socket.io client
├── store/              # Redux state management
│   ├── index.ts        # Store configuration
│   └── slices/
│       ├── authSlice.ts       # Authentication state
│       ├── cartSlice.ts       # Shopping cart state
│       ├── orderSlice.ts      # Orders state
│       └── productSlice.ts    # Products state
├── App.tsx             # Main App component
└── main.tsx            # Entry point
```

## Key Features Implemented

### 1. Authentication & Authorization
- Login/Register with email & password
- OAuth2/OIDC via Keycloak
- JWT token refresh mechanism
- Role-based access control
- Protected routes for admin

### 2. Product Management
- Browse products with pagination
- Search and filter by category
- Product detail view with reviews
- Add product reviews
- Real-time stock updates

### 3. Shopping Cart & Checkout
- Add/remove items from cart
- Update quantities
- Multi-step checkout process
- Address management
- Order confirmation

### 4. User Profile
- Edit personal information
- Change password
- Manage saved addresses
- View order history
- Payment method management

### 5. Admin Dashboard
- View system statistics
- Monitor revenue trends
- Track order status
- Analyze product performance
- Real-time metrics via Prometheus

### 6. Real-time Features
- WebSocket connection for order updates
- Live stock availability
- Push notifications
- Order status tracking

## Code Standards

### TypeScript
- Strict mode enabled
- Proper type definitions for all components
- Interface definitions for data structures

### React Best Practices
- Functional components with hooks
- Custom hooks for business logic
- Proper dependency arrays
- Error boundary handling

### Redux Patterns
- Slice pattern with Redux Toolkit
- Thunks for async operations
- Proper action types
- Normalized state shape

### Styling
- Material-UI for consistent design
- Emotion for styled components
- Responsive design with Grid system
- Dark mode support (extensible)

## Testing Strategy

### Unit Tests
```bash
npm test
```

### Integration Tests
- API integration tests
- Redux store tests
- Component integration tests

### E2E Tests (with Cypress)
```bash
npm run cypress:open
```

## Performance Optimization
- Code splitting with React Router
- Lazy loading of components
- Image optimization
- Caching strategies with Redux
- Request deduplication with Axios

## Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
