# CityHelp Frontend

A modern React application for reporting and managing city issues.

## Features

- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **Authentication**: Secure login system with context-based state management
- **Issue Reporting**: Easy-to-use form with image upload and location detection
- **Dashboard**: Comprehensive overview of reported issues with statistics
- **Real-time Updates**: Live data fetching and error handling
- **Mobile Responsive**: Works seamlessly on all device sizes

## Key Improvements Made

### 1. **Architecture & Structure**
- Fixed routing structure with proper React Router setup
- Implemented context-based authentication state management
- Created reusable components (Header, AuthContext)
- Clean separation of concerns

### 2. **User Experience**
- Modern, intuitive login page with proper error handling
- Comprehensive dashboard with statistics and issue management
- Enhanced issue reporting form with drag-and-drop image upload
- Loading states and success/error feedback
- Automatic location detection with fallback

### 3. **Design & Styling**
- Professional UI using Tailwind CSS
- Consistent color scheme and typography
- Responsive design for all screen sizes
- Custom animations and transitions
- Accessible form controls and navigation

### 4. **Functionality**
- Proper error handling and validation
- Image upload with size limits and preview
- Real-time location detection
- Status-based issue categorization
- Statistics dashboard with visual indicators

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

## Demo Credentials

- Username: `admin`
- Password: `secret`

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and development server
- **Context API** - State management

## Project Structure

```
src/
├── components/
│   └── Header.jsx          # Navigation header
├── contexts/
│   └── AuthContext.jsx     # Authentication state management
├── pages/
│   ├── Dashboard.jsx       # Main dashboard
│   ├── LoginPage.jsx       # Authentication page
│   └── ReportIssue.jsx     # Issue reporting form
├── App.jsx                 # Main application component
├── main.jsx               # Application entry point
└── index.css              # Global styles
```

## Features in Detail

### Authentication
- Secure login with error handling
- Context-based state management
- Protected routes
- Automatic token validation

### Dashboard
- Issue statistics overview
- Recent issues list with filtering
- Status-based categorization
- Image previews for issues
- Responsive grid layout

### Issue Reporting
- Multi-step form with validation
- Automatic location detection
- Image upload with preview
- File size validation
- Success confirmation with redirect

### Error Handling
- Comprehensive error states
- User-friendly error messages
- Retry mechanisms
- Loading indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)