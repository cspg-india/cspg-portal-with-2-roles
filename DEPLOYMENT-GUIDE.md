# 🚀 Quick Deployment Guide for Hostinger

## Step-by-Step Deployment

### Step 1: Prepare Files
1. Download the complete `cspg-portal` folder
2. Verify all files are present:
   - 5 HTML files
   - 4 CSS files in `css` folder
   - 8 JavaScript files in `js` folder

### Step 2: Access Hostinger
1. Login to Hostinger control panel
2. Navigate to **File Manager**
3. Open `public_html` directory

### Step 3: Upload Files

#### Option A: Direct Upload
1. Click **Upload** button in File Manager
2. Select all files and folders
3. Upload maintaining the structure:
   ```
   public_html/
   ├── index.html
   ├── login.html
   ├── signup.html
   ├── admin-login.html
   ├── admin-dashboard.html
   ├── README.md
   ├── css/
   │   ├── main.css
   │   ├── auth.css
   │   ├── dashboard.css
   │   └── admin.css
   └── js/
       ├── storage.js
       ├── auth.js
       ├── ui.js
       ├── api.js
       ├── submission.js
       ├── dashboard.js
       ├── admin.js
       └── admin-dashboard.js
   ```

#### Option B: FTP Upload
1. Use FileZilla or similar FTP client
2. Connect with Hostinger FTP credentials
3. Upload all files to `public_html`

### Step 4: Set Permissions (Usually Automatic)
Files should have permission 644
Folders should have permission 755

### Step 5: Test the Installation

#### Test User Portal
1. Visit: `https://yourdomain.com/signup.html`
2. Create a test account
3. Login at: `https://yourdomain.com/login.html`
4. Submit a test manuscript
5. Check dashboard displays correctly

#### Test Admin Portal
1. Visit: `https://yourdomain.com/admin-login.html`
2. Login with:
   ```
   Email: admin@cspg.org
   Password: CSPGAdmin@2025
   ```
3. Verify all tabs work
4. **IMMEDIATELY** go to Settings and change credentials

### Step 6: Initial Configuration

#### Must Do:
1. **Change admin password** from Settings tab
2. Optionally change admin email
3. Create first real user account
4. Test full workflow:
   - User submits manuscript
   - Admin updates status
   - Admin processes payment
   - User sees updates

#### Recommended:
1. Customize journal list in `index.html`
2. Add your institution logo
3. Update contact information
4. Set up Google Sheets integration (optional)

### Step 7: SSL/HTTPS Setup
1. In Hostinger control panel
2. Go to **SSL/TLS**
3. Enable free Let's Encrypt SSL
4. Force HTTPS redirect

## 🎯 Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] User signup works
- [ ] User login works
- [ ] User can submit manuscript
- [ ] User dashboard shows data correctly
- [ ] Admin login works
- [ ] Admin can see all submissions
- [ ] Admin can update status
- [ ] Admin can process payments
- [ ] Admin can delete submissions
- [ ] Admin can delete users
- [ ] Settings work for both user and admin
- [ ] CSV exports work
- [ ] Mobile responsive design works
- [ ] HTTPS is enabled
- [ ] Admin credentials changed

## 🔧 Troubleshooting

### Files Not Uploading
- Check file size limits in Hostinger
- Try uploading in smaller batches
- Use FTP if web upload fails

### Pages Show 404
- Verify files are in correct location
- Check file names match exactly (case-sensitive)
- Clear browser cache

### JavaScript Not Working
- Check browser console for errors
- Verify all JS files uploaded correctly
- Ensure no special characters in filenames

### Can't Login
- Check if localStorage is enabled in browser
- Try incognito mode
- Clear browser data and try again

## 📱 Testing on Mobile

1. Visit site on mobile device
2. Test user signup and login
3. Try submitting manuscript
4. Check admin dashboard on tablet
5. Verify all buttons are touch-friendly

## 🔄 Updating the Site

To update after deployment:
1. Edit files locally
2. Upload only changed files
3. Clear browser cache
4. Test changes

## 💾 Backup Strategy

Weekly backups:
1. Export submissions CSV from admin panel
2. Export users CSV from admin panel
3. Export payments CSV from admin panel
4. Download backup of all files via FTP

## 🆘 Emergency Access

If locked out of admin:
1. Access via FTP
2. Edit file or clear localStorage
3. Or use browser DevTools:
   ```javascript
   localStorage.clear();
   ```

## 🌟 Success Indicators

Your deployment is successful when:
- Users can signup and login
- Manuscripts can be submitted
- Admin can manage everything
- Data persists across sessions
- No console errors
- Mobile version works
- HTTPS is active

## 📞 Quick Links

- User Portal: `https://yourdomain.com/login.html`
- User Signup: `https://yourdomain.com/signup.html`
- Admin Portal: `https://yourdomain.com/admin-login.html`
- Dashboard: `https://yourdomain.com/index.html`

---

**Happy Deploying! 🎉**

For detailed documentation, see README.md
