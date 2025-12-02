# Setup Guide - Smart Urban Development Project

## Quick Start Guide

### Step 1: Install XAMPP

1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP (default location: `C:\xampp`)
3. Ensure you select:
   - Apache
   - MySQL
   - PHP
   - phpMyAdmin

### Step 2: Place Project Files

1. Copy the entire `SmartUrban` folder to:
   ```
   C:\xampp\htdocs\SmartUrban
   ```

2. Your project structure should be:
   ```
   C:\xampp\htdocs\SmartUrban\
   ├── api\
   ├── assets\
   ├── config\
   ├── database\
   ├── docs\
   └── index.html
   ```

### Step 3: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** for **Apache**
3. Click **Start** for **MySQL**
4. Both should show green "Running" status

### Step 4: Create Database

**Option A: Using phpMyAdmin (Recommended)**

1. Open browser: http://localhost/phpmyadmin
2. Click **New** in the left sidebar
3. Database name: `smarturban_db`
4. Collation: `utf8mb4_general_ci`
5. Click **Create**
6. Click **Import** tab
7. Choose file: `C:\xampp\htdocs\SmartUrban\database\smarturban_db.sql`
8. Click **Go**

**Option B: Using Command Line**

1. Open Command Prompt
2. Navigate to MySQL bin:
   ```
   cd C:\xampp\mysql\bin
   ```
3. Run MySQL:
   ```
   mysql -u root
   ```
4. Execute SQL file:
   ```sql
   source C:/xampp/htdocs/SmartUrban/database/smarturban_db.sql
   ```

### Step 5: Verify Database Connection

1. Open: `config/database.php`
2. Verify settings (default should work):
   ```php
   private $host = "localhost";
   private $db_name = "smarturban_db";
   private $username = "root";
   private $password = "";
   ```

### Step 6: Access Application

1. Open browser
2. Navigate to: http://localhost/SmartUrban
3. You should see the Smart Urban Login Page
4. **Login Credentials:**
   - Username: `admin`
   - Password: `admin123`
5. After successful login, you'll be redirected to the dashboard

## Testing the Installation

### Test Database Connection

1. Create a test file: `test_db.php` in project root
2. Add this code:
   ```php
   <?php
   require_once 'config/database.php';
   $db = new Database();
   if ($db->testConnection()) {
       echo "Database connection successful!";
   } else {
       echo "Database connection failed!";
   }
   ?>
   ```
3. Open: http://localhost/SmartUrban/test_db.php
4. Should display: "Database connection successful!"
5. Delete `test_db.php` after testing

### Test API Endpoints

1. Open browser console (F12)
2. Navigate to: http://localhost/SmartUrban
3. Check for any JavaScript errors
4. Try clicking on different feature tabs
5. Try adding a test record

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solutions:**
- Verify MySQL is running in XAMPP
- Check database name is `smarturban_db`
- Verify username is `root` and password is empty
- Try creating database manually in phpMyAdmin

### Issue: "404 Not Found" or "Page not found"

**Solutions:**
- Verify project is in `C:\xampp\htdocs\SmartUrban`
- Check Apache is running
- Try: http://localhost/SmartUrban/index.html
- Check file permissions

### Issue: "API not responding"

**Solutions:**
- Check Apache is running
- Verify PHP is enabled
- Check browser console for CORS errors
- Verify `api/` folder exists and files are present

### Issue: "Data not loading"

**Solutions:**
- Check browser console for errors
- Verify database has tables
- Check API endpoints are accessible
- Verify JavaScript file is loaded

### Issue: "Styles not loading"

**Solutions:**
- Check `assets/css/style.css` exists
- Verify file paths in HTML
- Clear browser cache
- Check browser console for 404 errors

## Configuration Options

### Change Database Credentials

Edit `config/database.php`:
```php
private $host = "localhost";        // Your MySQL host
private $db_name = "smarturban_db"; // Your database name
private $username = "root";         // Your MySQL username
private $password = "your_password"; // Your MySQL password
```

### Change API Base URL

Edit `assets/js/app.js`:
```javascript
const API_BASE = 'api';  // Change if API is in different location
```

### Enable Error Display (Development Only)

Edit `api/config.php`:
```php
ini_set('display_errors', 1);  // Change from 0 to 1
```

## Port Configuration

If port 80 is in use:

1. Change Apache port in XAMPP:
   - Open XAMPP Control Panel
   - Click **Config** → **httpd.conf**
   - Change `Listen 80` to `Listen 8080`
   - Change `ServerName localhost:80` to `ServerName localhost:8080`
   - Restart Apache

2. Access via: http://localhost:8080/SmartUrban

## Production Deployment

For production deployment:

1. **Security:**
   - Change database password
   - Enable HTTPS
   - Add authentication
   - Disable error display

2. **Performance:**
   - Enable PHP opcache
   - Use CDN for assets
   - Optimize database queries
   - Enable caching

3. **Backup:**
   - Regular database backups
   - Version control
   - Document changes

## Next Steps

After successful installation:

1. ✅ Verify all features work
2. ✅ Test CRUD operations
3. ✅ Add sample data
4. ✅ Explore all 6 features
5. ✅ Review documentation

## Support

If you encounter issues:

1. Check this guide
2. Review main README.md
3. Check XAMPP logs
4. Check browser console
5. Verify all files are present

---

**Happy Coding!** 🚀

