# TechVault Backend API

A comprehensive e-commerce backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Full CRUD operations with advanced filtering and search
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment processing with webhooks
- **Email Notifications**: Automated order confirmations and updates
- **File Uploads**: Image upload with Cloudinary integration
- **Real-time Updates**: Socket.IO for live order updates
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM
- **TypeScript**: Full type safety throughout the application

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Stripe account for payments

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook endpoint

## Database Models

### User
- Authentication and profile information
- Role-based access (customer/admin)
- Address and preferences

### Product
- Complete product information
- Inventory management
- SEO optimization
- Image gallery

### Category
- Hierarchical category structure
- SEO-friendly slugs
- Product count virtuals

### Order
- Complete order lifecycle
- Payment tracking
- Shipping information
- Status management

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Joi and express-validator
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication
- **Admin Protection**: Role-based route protection

## Payment Processing

### Stripe Integration
- Secure payment intent creation
- Webhook handling for payment events
- Order status synchronization
- Refund support (can be extended)

## Email System

### Automated Emails
- Order confirmations
- Password reset
- Shipping notifications
- Customizable templates

## File Upload

### Cloudinary Integration
- Image optimization
- Multiple format support
- CDN delivery
- Automatic resizing

## Real-time Features

### Socket.IO
- Live order updates for admin
- Real-time inventory changes
- Customer notifications

## Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
```

### Project Structure
```
src/
├── config/         # Database and app configuration
├── middleware/     # Express middleware
├── models/         # Mongoose models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.ts       # Main server file
```

## Deployment

### Environment Variables
Set all required environment variables in production:
- `NODE_ENV=production`
- `MONGODB_URI` - Production database URL
- `JWT_SECRET` - Strong secret key
- `STRIPE_SECRET_KEY` - Production Stripe key
- Email service credentials

### Production Considerations
- Use PM2 for process management
- Set up MongoDB replica set
- Configure reverse proxy (nginx)
- Enable SSL/TLS
- Set up monitoring and logging
- Configure backup strategy

## API Documentation

The API follows RESTful conventions with consistent response formats:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors if applicable
  ]
}
```

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details