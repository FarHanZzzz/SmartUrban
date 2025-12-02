# Smart Urban Development Project

![Smart Urban](https://img.shields.io/badge/Smart-Urban-blue) ![PHP](https://img.shields.io/badge/PHP-7.4+-purple) ![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange) ![License](https://img.shields.io/badge/License-Educational-green)

An integrated, technology-driven solution designed to make modern cities more sustainable, efficient, and safe. This system combines database management and artificial intelligence (AI) to monitor, analyze, and optimize various aspects of urban living.

## 🌟 Features

### 1. 🚦 Smart City Traffic Management
- Real-time traffic data collection and storage
- Congestion monitoring and analysis
- Accident reporting and tracking
- Route optimization support

### 2. 🅿️ Smart Parking System
- Parking spot availability tracking
- Online reservation system
- Real-time availability updates
- Zone-based management

### 3. ♻️ Waste Management & Recycling Tracking
- Waste collection scheduling
- Recycling plant management
- Transportation route tracking
- Waste type classification

### 4. ⚡ Smart Energy Monitoring System
- Real-time energy consumption tracking
- Water and gas usage monitoring
- Anomaly detection
- Cost analysis

### 5. 🌬️ Air Quality & Pollution Monitoring (AI-Based)
- Real-time pollution data collection
- Air Quality Index (AQI) calculation
- Pollution forecasting
- Alert system

### 6. 🚨 Emergency Response & Public Safety System
- Emergency incident reporting
- Vehicle dispatch management
- Response time tracking
- Performance analytics

## 🚀 Quick Start

### Prerequisites

- **XAMPP** (or similar LAMP/WAMP stack)
  - Download: https://www.apachefriends.org/
  - Includes: Apache, MySQL, PHP, phpMyAdmin

### Installation

1. **Extract Project**
   ```
   Extract to: C:\xampp\htdocs\SmartUrban
   ```

2. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start **Apache**
   - Start **MySQL**

3. **Create Database**
   - Open: http://localhost/phpmyadmin
   - Import: `database/smarturban_db.sql`

4. **Access Application**
   - Open: http://localhost/SmartUrban
   - **Login Credentials:**
     - Username: `admin`
     - Password: `admin123`
   - After login, you'll be redirected to the dashboard

📖 **Detailed Setup Guide**: See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## 📁 Project Structure

```
SmartUrban/
├── api/                    # Backend API endpoints
│   ├── config.php         # API configuration
│   ├── traffic.php        # Traffic management API
│   ├── parking.php        # Parking system API
│   ├── waste.php          # Waste management API
│   ├── energy.php         # Energy monitoring API
│   ├── pollution.php      # Pollution monitoring API
│   └── emergency.php      # Emergency response API
├── assets/
│   ├── css/
│   │   └── style.css      # Modern UI stylesheet
│   └── js/
│       └── app.js         # Frontend JavaScript
├── config/
│   └── database.php       # Database configuration
├── database/
│   └── smarturban_db.sql  # Complete database schema
├── docs/                  # Comprehensive documentation
│   ├── README.md         # Main documentation
│   ├── SETUP_GUIDE.md    # Installation guide
│   └── API_DOCUMENTATION.md # API reference
└── index.html            # Main application page
```

## 🗄️ Database Schema

The system uses **12 main tables**:

1. `TrafficData` - Traffic flow and accident records
2. `ParkingSpots` - Parking location and availability
3. `Reservations` - Parking reservations
4. `WasteTypes` - Waste categorization
5. `Collection` - Waste collection records
6. `RecyclingPlants` - Recycling facility information
7. `Transportation` - Waste transport tracking
8. `EnergyUsage` - Energy consumption data
9. `PollutionData` - Air quality measurements
10. `Incidents` - Emergency incident reports
11. `EmergencyVehicles` - Emergency vehicle status
12. `ResponseTimes` - Emergency response performance

## 🎨 Features

### Modern UI
- ✅ Responsive design (mobile-friendly)
- ✅ Dark theme with modern aesthetics
- ✅ Intuitive navigation
- ✅ Real-time data updates
- ✅ Interactive tables and forms

### Full CRUD Operations
- ✅ Create - Add new records
- ✅ Read - View all records with filtering
- ✅ Update - Edit existing records
- ✅ Delete - Remove records

### API Endpoints
- ✅ RESTful API design
- ✅ JSON responses
- ✅ Error handling
- ✅ CORS enabled

## 📚 Documentation

- **[Main Documentation](docs/README.md)** - Complete project overview
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Step-by-step installation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - API reference

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+
- **Database**: MySQL (via XAMPP)
- **Server**: Apache (XAMPP)

## 📖 Usage

### Adding Data
1. Navigate to desired feature section
2. Click "Add" button
3. Fill in the form
4. Click "Save"

### Editing Data
1. Find record in table
2. Click "Edit" button (pencil icon)
3. Modify fields
4. Click "Save"

### Deleting Data
1. Find record in table
2. Click "Delete" button (trash icon)
3. Confirm deletion

## 🔧 Configuration

### Database Settings

Edit `config/database.php`:
```php
private $host = "localhost";
private $db_name = "smarturban_db";
private $username = "root";
private $password = "";
```

## 🐛 Troubleshooting

### Database Connection Failed
- Verify MySQL is running
- Check database name is `smarturban_db`
- Verify credentials in `config/database.php`

### Page Not Found
- Verify project is in `htdocs/SmartUrban`
- Check Apache is running
- Verify file permissions

### API Not Working
- Check Apache is running
- Verify PHP is enabled
- Check browser console for errors

## 🔒 Security Notes

For production deployment:
- Change database password
- Enable HTTPS
- Add user authentication
- Disable error display
- Implement input validation
- Use prepared statements (already implemented)

## 🚧 Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time notifications
- [ ] Data visualization charts
- [ ] Export functionality (PDF, Excel)
- [ ] Mobile app integration
- [ ] AI model integration for predictions
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 📝 License

This project is for **educational and research purposes**.

## 👥 Contributing

This is an academic project. For improvements:
1. Review code structure
2. Test thoroughly
3. Document changes
4. Follow coding standards

## 📞 Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review code comments
3. Check browser console
4. Verify database and server status

## 🎯 Project Goals

- ✅ Create a comprehensive smart city management system
- ✅ Implement all 6 core features
- ✅ Provide full CRUD operations
- ✅ Design modern, user-friendly interface
- ✅ Ensure database integration
- ✅ Provide complete documentation

## 📊 System Capabilities

- **Real-time Monitoring**: Track various city metrics
- **Data Management**: Efficient database operations
- **User Interface**: Modern, responsive design
- **API Integration**: RESTful API for all operations
- **Scalability**: Designed for future expansion

## 🌐 Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

## 📅 Version

**Current Version**: 1.0.0

**Release Date**: 2024

---

## 🎉 Getting Started

1. **Install XAMPP**
2. **Extract project to htdocs**
3. **Import database**
4. **Start services**
5. **Open browser and enjoy!**

For detailed instructions, see [Setup Guide](docs/SETUP_GUIDE.md).

---

**Built with ❤️ for Smart City Development**

*Making cities smarter, one feature at a time.*

