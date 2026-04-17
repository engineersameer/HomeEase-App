# HomeEase Mobile App - Folder Structure

## 📁 **New Organized Structure**

### **Customer Pages** (`/customer/`)
- `customer-home.jsx` - Main customer dashboard with quick actions and stats
- `customer-profile.jsx` - Profile management with theme toggle
- `customer-bookings.jsx` - Booking history and status management
- `customer-notifications.jsx` - Notifications and updates
- `customer-support.jsx` - Support, FAQ, and help resources
- `service-search.jsx` - Service discovery and filtering
- `service-booking.jsx` - Service booking flow
- `_layout.jsx` - Customer-specific navigation layout

### **Provider Pages** (`/provider/`)
- `provider-home.jsx` - Provider dashboard
- `_layout.jsx` - Provider-specific navigation layout

### **Shared Components** (`/shared/`)
- `BottomBar.jsx` - Universal bottom navigation for both roles
- `service-detail.jsx` - Reusable service detail component

### **Authentication** (`/(auth)/`)
- `customer-signin.jsx` - Customer login
- `customer-signup.jsx` - Customer registration
- `provider-signin.jsx` - Provider login
- `seller-signup.jsx` - Provider registration
- `_layout.jsx` - Auth layout

### **Legacy** (`/(home)/`)
- Old files that will be cleaned up
- Contains remaining files from previous structure

## 🚀 **Key Features**

### **Customer Features**
- ✅ **Dashboard** - Quick actions, stats, recent bookings
- ✅ **Service Search** - Filter by category, location, price
- ✅ **Booking Management** - Track status, cancel, review
- ✅ **Profile Management** - Personal info, theme toggle
- ✅ **Notifications** - Real-time updates and alerts
- ✅ **Support System** - FAQ, contact options, help resources

### **Provider Features**
- ✅ **Provider Dashboard** - Orders, earnings, schedule
- ✅ **Service Management** - Add, edit, manage services
- ✅ **Order Management** - Accept, complete, track orders

### **Shared Features**
- ✅ **Theme Support** - Light/Dark mode toggle
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Navigation** - Role-based bottom navigation
- ✅ **Service Details** - Reusable component

## 🎨 **Design System**

### **Colors**
- Primary: Brand colors for main actions
- Secondary: Supporting colors
- Light/Dark themes with automatic switching

### **Typography**
- Heading: Large titles and headers
- Subheading: Section titles
- Body: Main content text
- Caption: Small text and labels

### **Components**
- Cards with shadows and borders
- Consistent spacing and padding
- Emoji icons for visual appeal
- Modern rounded corners

## 📱 **Navigation Flow**

### **Customer Journey**
1. **Landing** → Choose role (Customer/Seller/Guest)
2. **Auth** → Sign up/Sign in
3. **Home** → Dashboard with quick actions
4. **Search** → Find services
5. **Book** → Complete booking
6. **Track** → Monitor bookings
7. **Profile** → Manage account

### **Provider Journey**
1. **Landing** → Choose role
2. **Auth** → Sign up/Sign in
3. **Home** → Provider dashboard
4. **Orders** → Manage incoming orders
5. **Services** → Manage service offerings
6. **Profile** → Provider account

## 🔧 **Technical Stack**

- **Framework**: Expo Router (React Navigation)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: React Hooks + AsyncStorage
- **API**: Axios for HTTP requests
- **Authentication**: JWT tokens
- **Storage**: AsyncStorage for local data

## 📊 **API Integration**

### **Customer Endpoints**
- `GET /api/customer/profile` - User profile
- `GET /api/customer/bookings` - Booking history
- `GET /api/customer/stats` - User statistics
- `POST /api/customer/bookings` - Create booking
- `PUT /api/customer/bookings/:id/status` - Update booking status

### **Provider Endpoints**
- `GET /api/provider/profile` - Provider profile
- `GET /api/provider/orders` - Incoming orders
- `PUT /api/provider/orders/:id/status` - Update order status

## 🚀 **Getting Started**

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npx expo start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 📝 **Notes**

- All customer pages are now organized in `/customer/` folder
- Shared components are in `/shared/` for reusability
- Provider pages are in `/provider/` folder
- Authentication pages remain in `/(auth)/` for routing
- Bottom navigation adapts based on user role
- Theme system supports light/dark modes
- All pages include proper error handling and loading states 