# CSPG India Academic Portal - Complete Production System

## 🚀 Features

### User Features
- ✅ Secure authentication with SHA-256 password hashing
- ✅ Personal dashboard with submission tracking
- ✅ Manuscript submission with file upload
- ✅ Real-time submission status updates
- ✅ Payment status tracking
- ✅ User profile settings with password change
- ✅ Responsive design for all devices

### Admin Features
- ✅ Complete admin dashboard
- ✅ Submission management with status updates
- ✅ Payment processing and tracking
- ✅ User management with viewing and deletion
- ✅ Submission deletion capability
- ✅ Activity logging for all admin actions
- ✅ CSV export for submissions, payments, and users
- ✅ Admin credentials management
- ✅ Search and filter functionality

## 📁 File Structure

```
cspg-portal/
├── index.html              # User dashboard
├── login.html              # User login page
├── signup.html             # User registration page
├── admin-login.html        # Admin login page
├── admin-dashboard.html    # Admin dashboard
├── css/
│   ├── main.css           # Core styles
│   ├── auth.css           # Authentication page styles
│   ├── dashboard.css      # User dashboard styles
│   └── admin.css          # Admin dashboard styles
└── js/
    ├── storage.js         # LocalStorage management
    ├── auth.js            # Authentication logic
    ├── ui.js              # UI utilities
    ├── api.js             # Google API integration
    ├── submission.js      # Submission management
    ├── dashboard.js       # User dashboard logic
    ├── admin.js           # Admin authentication & logic
    └── admin-dashboard.js # Admin dashboard logic
```

## 🔧 Installation & Deployment

### Option 1: Direct Upload to Hostinger

1. **Download** all files
2. **Login** to your Hostinger account
3. Go to **File Manager**
4. Navigate to `public_html` folder
5. **Upload** all files maintaining the folder structure
6. Access via your domain: `https://yourdomain.com`

### Option 2: Using FTP

1. Use an FTP client (FileZilla, etc.)
2. Connect to your Hostinger FTP
3. Upload all files to `public_html`
4. Maintain folder structure

## 👤 Default Credentials

### Admin Access
```
Email: admin@cspg.org
Password: CSPGAdmin@2025
```

**IMPORTANT:** Change these credentials immediately after first login from Settings!

### Test User (Create Your Own)
Visit `https://yourdomain.com/signup.html` to create test users

## 🎯 Key Features Explained

### 1. User Dashboard
- Personal submission tracking
- Manuscript upload (PDF/DOCX, max 50MB)
- Status monitoring (Under Review, Accepted, Rejected, Published)
- Payment tracking
- Settings for password change

### 2. Admin Dashboard

#### Overview Tab
- Real-time statistics
- Total submissions, users, revenue
- Recent submissions list
- Status and payment breakdowns

#### Submissions Tab
- View all submissions
- Search by ID, title, author
- Filter by status
- Update submission status
- Quick payment updates
- **Delete submissions** (with confirmation)
- Export to CSV

#### Payments Tab
- All payment records
- Filter by status (Pending, Paid, Failed)
- Process payments with details:
  - Amount
  - Payment method
  - Transaction ID
  - Date
- Export payment reports

#### Users Tab
- View all registered users
- See submission count per user
- View user details and submissions
- **Delete users** (deletes user and all their submissions)
- Export user list

#### Activity Log
- Tracks all admin actions
- Timestamps and admin details
- Audit trail for compliance

#### Settings
- Change admin email
- Change admin password
- Secure credential management

### 3. Settings Functionality

#### User Settings
- Accessible from user dashboard
- Change password securely
- Validates current password
- Requires password confirmation

#### Admin Settings  
- Accessible from admin dashboard
- Change admin email (optional)
- Change admin password
- Validates current credentials
- Auto-logout after update for security

### 4. Delete Functionality

#### Delete Submissions
- Admin can delete any submission
- Confirmation dialog prevents accidents
- Soft delete (marks as deleted, not permanent removal)
- Logged in activity log

#### Delete Users
- Admin can delete any user
- Deletes user AND all their submissions
- Confirmation dialog with warning
- Soft delete for data integrity
- Logged in activity log

## 🔐 Security Features

- SHA-256 password hashing
- Session management with 24-hour expiration
- Input sanitization (XSS prevention)
- File type and size validation
- Separate admin authentication
- Activity logging for accountability
- No demo/test data by default

## 📊 Data Management

### LocalStorage Schema

**Users:**
```javascript
{
  id: "unique_id",
  firstName: "John",
  lastName: "Doe",
  email: "john@university.edu",
  passwordHash: "sha256_hash",
  institution: "University Name",
  department: "Computer Science",
  position: "Professor",
  createdAt: "ISO_date",
  deleted: false
}
```

**Submissions:**
```javascript
{
  id: "SUB-ID",
  userId: "user_id",
  title: "Manuscript Title",
  abstract: "Abstract text",
  keywords: "keyword1, keyword2",
  journal: "Journal Name",
  status: "Under Review",
  paymentStatus: "Pending",
  paymentAmount: 5000,
  paymentMethod: "Bank Transfer",
  transactionId: "TXN123",
  paymentDate: "ISO_date",
  fileName: "file.pdf",
  fileSize: 1024000,
  dateSubmitted: "ISO_date",
  deleted: false
}
```

## 🌐 Google Integration (Optional)

To enable Google Sheets and Drive integration:

1. Create a Google Apps Script Web App
2. Deploy as accessible to "Anyone"
3. Update URLs in `js/api.js`:
   ```javascript
   const CONFIG = {
       SHEET_URL: 'YOUR_APPS_SCRIPT_URL',
       DRIVE_FOLDER: 'YOUR_DRIVE_FOLDER_ID'
   };
   ```

## 🎨 Customization

### Update Journal List
Edit `index.html` line ~60:
```html
<select class="form-select" id="journal">
    <option value="Your Journal">Your Journal</option>
</select>
```

### Update Branding
- Logo: Add to header in HTML files
- Colors: Edit CSS variables in `css/main.css`:
  ```css
  :root {
      --color-accent: #A8314F;
      --color-dark: #333842;
  }
  ```

### Payment Amounts
Default payment amount in admin payment modal:
Edit `js/admin-dashboard.js` line with `value="5000"`

## 🐛 Troubleshooting

### Login Issues
- Clear browser cache
- Check localStorage in DevTools
- Verify credentials are case-sensitive

### File Upload Issues
- Check file type (PDF or DOCX only)
- Verify file size (max 50MB)
- Check browser console for errors

### Admin Can't Delete
- Ensure you're logged in as admin
- Check browser console for JavaScript errors
- Verify confirmation dialog appears

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚦 Production Checklist

- [ ] Upload all files to Hostinger
- [ ] Access admin panel and login
- [ ] Change admin credentials from Settings
- [ ] Create test user account
- [ ] Submit test manuscript
- [ ] Test admin features (status update, payment, delete)
- [ ] Test user features (view submission, settings)
- [ ] Configure Google integration (optional)
- [ ] Update journal list
- [ ] Add branding/logo
- [ ] Enable HTTPS in Hostinger
- [ ] Test on mobile devices

## 💡 Tips

1. **Regular Backups**: Use CSV exports weekly
2. **Activity Monitoring**: Check activity log regularly
3. **User Communication**: Have email ready for status updates
4. **Data Cleanup**: Periodically review deleted items
5. **Password Security**: Change admin password every 3 months

## 🔄 Updates & Maintenance

### To Add New Features
1. Edit relevant HTML file
2. Update CSS if needed
3. Modify JavaScript logic
4. Test thoroughly before deployment
5. Upload updated files

### To Clear All Data
Open browser console on any page:
```javascript
localStorage.clear();
location.reload();
```

## 📞 Support

For issues:
1. Check browser console (F12) for errors
2. Verify localStorage data in DevTools
3. Test in incognito mode
4. Try different browser

## 📝 License

Proprietary - CSPG India Academic Portal

---

**Version:** 2.0.0 (Production Ready)
**Last Updated:** February 2026
**Status:** ✅ Production Ready - No Demo Data
