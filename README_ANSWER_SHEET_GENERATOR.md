# Answer Sheet Generator - AI-Powered Academic Assessment Tool

## Overview
This is a React-based frontend application for an AI-powered Answer Sheet Generator system. The application allows users to upload questionnaire PDFs and reference answer sheets to generate customized academic answer sheets using AI.

## Features

### 🔐 Authentication
- **Sign In Page** (`/auth/sign-in`) - Secure login with email/password
- **Protected Routes** - All admin pages require authentication
- **Session Management** - JWT token-based authentication with remember me option
- **Auto-redirect** - Redirects authenticated users away from login page

### 📝 Answer Sheet Generation
- **Generate Page** (`/admin/generate`) - Main dashboard for creating answer sheets
  - Upload questionnaire PDF files (drag & drop support)
  - Upload multiple reference DOCX files
  - Enter learner information (name, number)
  - Real-time progress tracking during generation
  - Download generated answer sheets

### 📋 History Management
- **List Page** (`/admin/list`) - View all previously generated answer sheets
  - Search and filter functionality
  - Detailed view with metadata
  - Download and delete operations
  - Pagination support

### ⚙️ System Configuration
- **Settings Page** (`/admin/settings`) - Configure AI behavior and system preferences
  - Number of sheets to generate (1-10)
  - OpenAI model selection (GPT-4o, GPT-4o-mini, etc.)
  - Custom AI prompts for answer generation
  - API key management with test functionality
  - System preferences (auto-save, notifications)

### 📥 Sample Downloads
- **Download Sample Page** (`/admin/download-sample`) - Get sample answer sheets
  - Professional NEBOSH-style format examples
  - Feature demonstrations
  - Usage instructions

### 👤 User Management
- **Profile Page** (`/admin/profile`) - Manage user account
  - Edit personal information
  - Change password with validation
  - Account information display

### 🚪 Logout
- **Logout Functionality** - Secure session termination
  - Clear all stored data
  - API logout call
  - Redirect to sign-in page

## Technical Stack

### Frontend
- **React 19.0.0** - Modern React with hooks
- **Chakra UI 2.6.1** - Component library and styling
- **React Router DOM 6.25.1** - Client-side routing
- **React Dropzone 14.2.3** - File upload functionality
- **React Icons 5.2.1** - Icon library
- **Framer Motion 11.3.7** - Animations

### State Management
- **React Context API** - Authentication state management
- **Local Storage/Session Storage** - Persistent data storage
- **React Hooks** - Component state management

### Authentication
- **JWT Tokens** - Secure authentication
- **Protected Routes** - Route-level security
- **Session Management** - Persistent login sessions

## API Integration

The application integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Answer Sheet Generation
- `POST /api/generate-answers` - Generate answer sheets (multipart/form-data)
- `POST /api/download-answer-sheet` - Download specific answer sheet
- `GET /api/download-sample` - Download sample answer sheet

### Settings & Profile
- `GET /api/settings` - Fetch system settings
- `PUT /api/settings` - Update system settings
- `GET /api/user/profile` - Fetch user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change user password
- `POST /api/test-openai-key` - Test OpenAI API key

### History
- `GET /api/answer-sheets/history` - Fetch generation history
- `DELETE /api/answer-sheets/:id` - Delete answer sheet

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.js          # Route protection component
│   ├── logout/
│   │   └── LogoutButton.js            # Logout functionality
│   ├── navbar/
│   │   └── NavbarLinksAdmin.js        # Updated navigation
│   └── sidebar/
│       └── components/
│           └── Brand.js               # Updated branding
├── contexts/
│   └── AuthContext.js                 # Authentication context
├── layouts/
│   ├── admin/
│   │   └── index.js                   # Protected admin layout
│   └── auth/
│       └── index.js                   # Auth layout
├── views/
│   ├── admin/
│   │   ├── generate/
│   │   │   └── index.jsx              # Main generation page
│   │   ├── list/
│   │   │   └── index.jsx              # History management
│   │   ├── settings/
│   │   │   └── index.jsx              # System settings
│   │   ├── download-sample/
│   │   │   └── index.jsx              # Sample downloads
│   │   └── profile/
│   │       └── index.jsx              # User profile
│   └── auth/
│       └── signIn/
│           └── index.jsx              # Enhanced sign-in page
├── routes.js                          # Updated routing configuration
└── App.js                             # Main app with AuthProvider
```

## Key Features Implemented

### 🎨 User Interface
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Modern UI** - Clean, professional interface using Chakra UI
- **Dark/Light Mode** - Toggle between color schemes
- **Loading States** - Proper loading indicators for all operations
- **Error Handling** - User-friendly error messages and validation

### 🔒 Security
- **Protected Routes** - All admin pages require authentication
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Client-side form validation
- **Secure Logout** - Complete session cleanup

### 📱 User Experience
- **Drag & Drop Upload** - Easy file upload interface
- **Real-time Feedback** - Progress indicators and status updates
- **Search & Filter** - Advanced filtering in history page
- **Keyboard Navigation** - Accessible keyboard shortcuts
- **Toast Notifications** - Success/error feedback

### 🔧 Configuration
- **Flexible AI Settings** - Customizable AI behavior
- **API Key Management** - Secure API key storage and testing
- **System Preferences** - User-configurable options
- **Fallback Storage** - LocalStorage backup for offline functionality

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access Application**
   - Open http://localhost:3000
   - Use demo credentials: `admin@example.com` / `password123`

## Demo Credentials
- **Email:** admin@example.com
- **Password:** password123

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

### Authentication Flow
1. User visits any admin page → Redirected to `/auth/sign-in`
2. User logs in → Token stored, redirected to `/admin/generate`
3. User can navigate between protected pages
4. User logs out → All data cleared, redirected to sign-in

### File Upload
- **PDF Files:** Questionnaire files (max 10MB)
- **DOCX Files:** Reference answer sheets (max 10MB each)
- **Validation:** File type and size validation
- **Progress:** Real-time upload progress

### Error Handling
- **Network Errors:** Graceful fallback to localStorage
- **API Errors:** User-friendly error messages
- **Validation Errors:** Real-time form validation
- **File Errors:** Clear file upload error messages

## Future Enhancements
- [ ] Real-time collaboration features
- [ ] Advanced AI model selection
- [ ] Batch processing capabilities
- [ ] Export to multiple formats
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile app version

## Support
For technical support or questions about the Answer Sheet Generator, please refer to the Settings page or contact the development team.
