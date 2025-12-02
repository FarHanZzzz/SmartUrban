-- Smart Urban Development Project Database Schema
-- MySQL Database for XAMPP
-- Created for Smart Urban Development System

CREATE DATABASE IF NOT EXISTS smarturban_db;
USE smarturban_db;

-- ============================================
-- Feature 1: Smart City Traffic Management
-- ============================================

CREATE TABLE IF NOT EXISTS TrafficData (
    traffic_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    vehicle_count INT NOT NULL DEFAULT 0,
    congestion_level ENUM('Low', 'Medium', 'High', 'Severe') DEFAULT 'Low',
    accident_reported BOOLEAN DEFAULT FALSE,
    accident_details TEXT,
    route_name VARCHAR(255),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sensor_id VARCHAR(100),
    speed_avg DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_timestamp (timestamp),
    INDEX idx_congestion (congestion_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Feature 2: Smart Parking System
-- ============================================

CREATE TABLE IF NOT EXISTS ParkingSpots (
    spot_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    spot_number VARCHAR(50) NOT NULL UNIQUE,
    zone VARCHAR(100),
    capacity INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    spot_type ENUM('Standard', 'Handicap', 'Electric', 'Premium') DEFAULT 'Standard',
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_available (is_available),
    INDEX idx_zone (zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    spot_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled') DEFAULT 'Pending',
    payment_status ENUM('Pending', 'Paid', 'Refunded') DEFAULT 'Pending',
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    vehicle_plate VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (spot_id) REFERENCES ParkingSpots(spot_id) ON DELETE CASCADE,
    INDEX idx_spot (spot_id),
    INDEX idx_user_email (user_email),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Feature 3: Waste Management & Recycling Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS WasteTypes (
    waste_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('Organic', 'Plastic', 'Electronic', 'Metal', 'Paper', 'Glass', 'Hazardous', 'Other') NOT NULL,
    description TEXT,
    recycling_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Collection (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    waste_type_id INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    bin_id VARCHAR(100),
    fill_level INT DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
    collection_status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    scheduled_date DATETIME NOT NULL,
    collected_date DATETIME,
    weight_kg DECIMAL(10,2),
    collector_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (waste_type_id) REFERENCES WasteTypes(waste_type_id) ON DELETE RESTRICT,
    INDEX idx_location (location),
    INDEX idx_status (collection_status),
    INDEX idx_scheduled_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS RecyclingPlants (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity_tons DECIMAL(10,2),
    waste_types_accepted TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    operational_status ENUM('Active', 'Maintenance', 'Closed') DEFAULT 'Active',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (operational_status),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Transportation (
    transport_id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    plant_id INT,
    vehicle_id VARCHAR(100) NOT NULL,
    driver_name VARCHAR(255),
    route_description TEXT,
    departure_time DATETIME,
    arrival_time DATETIME,
    distance_km DECIMAL(10,2),
    fuel_consumption_liters DECIMAL(10,2),
    status ENUM('Scheduled', 'In Transit', 'Delivered', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES Collection(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES RecyclingPlants(plant_id) ON DELETE SET NULL,
    INDEX idx_collection (collection_id),
    INDEX idx_status (status),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Feature 4: Smart Energy Monitoring System
-- ============================================

CREATE TABLE IF NOT EXISTS EnergyUsage (
    usage_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    consumer_type ENUM('Household', 'Industrial', 'Commercial', 'Public') NOT NULL,
    meter_id VARCHAR(100) NOT NULL,
    energy_kwh DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    water_liters DECIMAL(10,2) DEFAULT 0.00,
    gas_m3 DECIMAL(10,2) DEFAULT 0.00,
    reading_date DATETIME NOT NULL,
    cost_usd DECIMAL(10,2) DEFAULT 0.00,
    anomaly_detected BOOLEAN DEFAULT FALSE,
    anomaly_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_consumer_type (consumer_type),
    INDEX idx_reading_date (reading_date),
    INDEX idx_meter_id (meter_id),
    INDEX idx_anomaly (anomaly_detected)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Feature 5: Air Quality & Pollution Monitoring
-- ============================================

CREATE TABLE IF NOT EXISTS PollutionData (
    pollution_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    sensor_id VARCHAR(100),
    pm25 DECIMAL(6,2),
    pm10 DECIMAL(6,2),
    co2_ppm DECIMAL(8,2),
    no2_ppb DECIMAL(8,2),
    o3_ppb DECIMAL(8,2),
    noise_level_db DECIMAL(5,2),
    air_quality_index INT CHECK (air_quality_index >= 0 AND air_quality_index <= 500),
    quality_status ENUM('Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous') DEFAULT 'Good',
    predicted_level DECIMAL(6,2),
    cause_identified VARCHAR(255),
    alert_issued BOOLEAN DEFAULT FALSE,
    reading_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_reading_date (reading_date),
    INDEX idx_quality_status (quality_status),
    INDEX idx_alert (alert_issued)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Feature 6: Emergency Response & Public Safety System
-- ============================================

CREATE TABLE IF NOT EXISTS Incidents (
    incident_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_type ENUM('Accident', 'Fire', 'Medical', 'Crime', 'Natural Disaster', 'Other') NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    reported_by VARCHAR(255),
    reporter_phone VARCHAR(20),
    status ENUM('Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Reported',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    reported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    assigned_vehicle_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (incident_type),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_reported_at (reported_at),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS EmergencyVehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('Police', 'Fire', 'Ambulance', 'Other') NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    current_location VARCHAR(255),
    status ENUM('Available', 'Dispatched', 'On Scene', 'Returning', 'Maintenance') DEFAULT 'Available',
    assigned_incident_id INT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_incident_id) REFERENCES Incidents(incident_id) ON DELETE SET NULL,
    INDEX idx_type (vehicle_type),
    INDEX idx_status (status),
    INDEX idx_assigned (assigned_incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ResponseTimes (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    dispatch_time DATETIME NOT NULL,
    arrival_time DATETIME,
    resolution_time DATETIME,
    response_time_minutes INT,
    travel_distance_km DECIMAL(10,2),
    performance_rating ENUM('Excellent', 'Good', 'Average', 'Poor') DEFAULT 'Good',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES Incidents(incident_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES EmergencyVehicles(vehicle_id) ON DELETE CASCADE,
    INDEX idx_incident (incident_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_dispatch_time (dispatch_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Sample Data Insertion (Optional)
-- ============================================

-- Insert sample waste types
INSERT INTO WasteTypes (type_name, category, description, recycling_rate) VALUES
('Organic Waste', 'Organic', 'Food scraps, garden waste', 85.00),
('Plastic Bottles', 'Plastic', 'PET bottles and containers', 60.00),
('Electronic Waste', 'Electronic', 'E-waste, batteries', 45.00),
('Metal Scrap', 'Metal', 'Aluminum, steel cans', 90.00),
('Paper & Cardboard', 'Paper', 'Newspapers, cardboard boxes', 70.00),
('Glass Containers', 'Glass', 'Bottles and jars', 80.00);

-- Insert sample parking spots
INSERT INTO ParkingSpots (location, spot_number, zone, capacity, is_available, spot_type, hourly_rate) VALUES
('Downtown Plaza', 'P001', 'Zone A', 1, FALSE, 'Standard', 2.50),
('Downtown Plaza', 'P002', 'Zone A', 1, FALSE, 'Standard', 2.50),
('City Center', 'P003', 'Zone B', 1, FALSE, 'Premium', 5.00),
('City Center', 'P004', 'Zone B', 1, FALSE, 'Handicap', 2.50),
('Tech Park', 'P005', 'Zone C', 1, FALSE, 'Electric', 3.00),
('Downtown Plaza', 'P006', 'Zone A', 1, TRUE, 'Standard', 2.50),
('City Center', 'P007', 'Zone B', 1, TRUE, 'Premium', 5.00),
('Shopping Mall', 'P008', 'Zone D', 1, TRUE, 'Standard', 3.00),
('University Campus', 'P009', 'Zone E', 1, TRUE, 'Standard', 2.00),
('Hospital Area', 'P010', 'Zone F', 1, TRUE, 'Handicap', 2.50),
('Airport Terminal', 'P011', 'Zone G', 1, TRUE, 'Premium', 8.00),
('Train Station', 'P012', 'Zone H', 1, TRUE, 'Standard', 3.50);

-- Insert sample recycling plants
INSERT INTO RecyclingPlants (plant_name, location, capacity_tons, waste_types_accepted, contact_person, contact_phone, operational_status) VALUES
('Green Recycling Center', 'Industrial Area North', 500.00, 'Plastic, Metal, Paper', 'John Smith', '+1234567890', 'Active'),
('Eco Waste Processing', 'Industrial Area South', 750.00, 'Organic, Electronic, Glass', 'Jane Doe', '+0987654321', 'Active'),
('City Recycling Hub', 'Downtown East', 300.00, 'All Types', 'Mike Johnson', '+1122334455', 'Active');

-- Insert sample emergency vehicles
INSERT INTO EmergencyVehicles (vehicle_type, vehicle_number, current_location, status) VALUES
('Police', 'POL-001', 'Police Station Main', 'Available'),
('Fire', 'FIR-001', 'Fire Station Central', 'Available'),
('Ambulance', 'AMB-001', 'Hospital Emergency', 'Available'),
('Police', 'POL-002', 'Police Station North', 'Available'),
('Ambulance', 'AMB-002', 'Medical Center', 'Available'),
('Fire', 'FIR-002', 'Fire Station South', 'Available'),
('Police', 'POL-003', 'Police Station East', 'Dispatched'),
('Ambulance', 'AMB-003', 'City Hospital', 'Available');

-- Insert sample traffic data
INSERT INTO TrafficData (location, vehicle_count, congestion_level, accident_reported, accident_details, route_name, sensor_id, speed_avg, timestamp) VALUES
('Downtown Main Street', 250, 'High', FALSE, NULL, 'Route A', 'SENSOR001', 35.5, '2024-01-15 08:30:00'),
('City Center Boulevard', 180, 'Medium', FALSE, NULL, 'Route B', 'SENSOR002', 45.2, '2024-01-15 09:15:00'),
('Highway 101 North', 320, 'Severe', TRUE, 'Multi-vehicle collision, 2 lanes blocked', 'Route C', 'SENSOR003', 15.0, '2024-01-15 10:00:00'),
('Tech Park Avenue', 95, 'Low', FALSE, NULL, 'Route D', 'SENSOR004', 55.8, '2024-01-15 11:20:00'),
('Industrial Zone Road', 210, 'Medium', FALSE, NULL, 'Route E', 'SENSOR005', 42.3, '2024-01-15 12:45:00'),
('Residential Area Street', 140, 'Low', FALSE, NULL, 'Route F', 'SENSOR006', 48.7, '2024-01-15 14:00:00'),
('Shopping District', 280, 'High', FALSE, NULL, 'Route G', 'SENSOR007', 32.1, '2024-01-15 15:30:00'),
('University Boulevard', 165, 'Medium', TRUE, 'Minor fender bender, no injuries', 'Route H', 'SENSOR008', 38.5, '2024-01-15 16:15:00');

-- Insert sample parking reservations
INSERT INTO Reservations (spot_id, user_name, user_email, user_phone, start_time, end_time, status, payment_status, total_amount, vehicle_plate) VALUES
(1, 'John Smith', 'john.smith@email.com', '+1234567890', '2024-01-15 09:00:00', '2024-01-15 11:00:00', 'Confirmed', 'Paid', 5.00, 'ABC123'),
(2, 'Sarah Johnson', 'sarah.j@email.com', '+0987654321', '2024-01-15 10:30:00', '2024-01-15 13:30:00', 'Active', 'Paid', 7.50, 'XYZ789'),
(3, 'Mike Davis', 'mike.davis@email.com', '+1122334455', '2024-01-15 14:00:00', '2024-01-15 16:00:00', 'Pending', 'Pending', 10.00, 'DEF456'),
(4, 'Emily Brown', 'emily.b@email.com', '+5566778899', '2024-01-15 08:00:00', '2024-01-15 10:00:00', 'Completed', 'Paid', 5.00, 'GHI789'),
(5, 'David Wilson', 'david.w@email.com', '+9988776655', '2024-01-15 12:00:00', '2024-01-15 15:00:00', 'Confirmed', 'Paid', 9.00, 'JKL012');

-- Insert sample waste collections
INSERT INTO Collection (waste_type_id, location, bin_id, fill_level, collection_status, scheduled_date, collected_date, weight_kg, collector_name) VALUES
(1, 'Downtown Plaza', 'BIN001', 85, 'Completed', '2024-01-15 08:00:00', '2024-01-15 08:30:00', 150.5, 'John Collector'),
(2, 'City Center', 'BIN002', 90, 'Completed', '2024-01-15 09:00:00', '2024-01-15 09:25:00', 75.2, 'Jane Collector'),
(3, 'Tech Park', 'BIN003', 45, 'Scheduled', '2024-01-15 10:00:00', NULL, NULL, NULL),
(4, 'Residential Area A', 'BIN004', 95, 'In Progress', '2024-01-15 11:00:00', NULL, NULL, 'Mike Collector'),
(5, 'Shopping Mall', 'BIN005', 70, 'Scheduled', '2024-01-15 12:00:00', NULL, NULL, NULL),
(6, 'University Campus', 'BIN006', 60, 'Completed', '2024-01-14 14:00:00', '2024-01-14 14:20:00', 120.8, 'Sarah Collector'),
(1, 'Industrial Zone', 'BIN007', 100, 'Completed', '2024-01-14 15:00:00', '2024-01-14 15:15:00', 200.0, 'John Collector'),
(2, 'Park Area', 'BIN008', 30, 'Scheduled', '2024-01-16 08:00:00', NULL, NULL, NULL);

-- Insert sample transportation records
INSERT INTO Transportation (collection_id, plant_id, vehicle_id, driver_name, route_description, departure_time, arrival_time, distance_km, fuel_consumption_liters, status) VALUES
(1, 1, 'TRUCK001', 'Driver John', 'Downtown Plaza to Green Recycling Center via Main Route', '2024-01-15 08:45:00', '2024-01-15 09:30:00', 12.5, 8.5, 'Delivered'),
(2, 2, 'TRUCK002', 'Driver Jane', 'City Center to Eco Waste Processing via Highway', '2024-01-15 09:40:00', '2024-01-15 10:20:00', 18.2, 12.0, 'Delivered'),
(4, 1, 'TRUCK003', 'Driver Mike', 'Residential Area to Green Recycling Center', '2024-01-15 11:15:00', NULL, 15.0, NULL, 'In Transit'),
(7, 3, 'TRUCK001', 'Driver John', 'Industrial Zone to City Recycling Hub', '2024-01-14 15:30:00', '2024-01-14 16:10:00', 20.5, 14.2, 'Delivered');

-- Insert sample energy usage data
INSERT INTO EnergyUsage (location, consumer_type, meter_id, energy_kwh, water_liters, gas_m3, reading_date, cost_usd, anomaly_detected, anomaly_details) VALUES
('Residential Building A - Unit 101', 'Household', 'METER001', 250.5, 1200.0, 15.5, '2024-01-15 00:00:00', 45.75, FALSE, NULL),
('Industrial Plant Alpha', 'Industrial', 'METER002', 5000.0, 50000.0, 250.0, '2024-01-15 00:00:00', 850.00, FALSE, NULL),
('Shopping Mall Central', 'Commercial', 'METER003', 3500.0, 25000.0, 180.0, '2024-01-15 00:00:00', 595.00, FALSE, NULL),
('Residential Building B - Unit 205', 'Household', 'METER004', 180.2, 800.0, 10.2, '2024-01-15 00:00:00', 32.85, FALSE, NULL),
('Office Complex Downtown', 'Commercial', 'METER005', 2800.0, 15000.0, 120.0, '2024-01-15 00:00:00', 476.00, FALSE, NULL),
('Factory Beta', 'Industrial', 'METER006', 7500.0, 80000.0, 400.0, '2024-01-15 00:00:00', 1275.00, TRUE, 'Unusually high consumption detected - possible equipment malfunction'),
('Public Library', 'Public', 'METER007', 450.0, 2000.0, 25.0, '2024-01-15 00:00:00', 76.50, FALSE, NULL),
('Residential Building C - Unit 310', 'Household', 'METER008', 320.8, 1500.0, 18.5, '2024-01-15 00:00:00', 58.45, FALSE, NULL);

-- Insert sample pollution data
INSERT INTO PollutionData (location, sensor_id, pm25, pm10, co2_ppm, no2_ppb, o3_ppb, noise_level_db, air_quality_index, quality_status, predicted_level, cause_identified, alert_issued, reading_date, latitude, longitude) VALUES
('City Center', 'SENSOR_P001', 25.5, 45.2, 410.0, 20.5, 35.0, 55.5, 75, 'Moderate', 80.0, 'Normal traffic conditions', FALSE, '2024-01-15 08:00:00', 40.7128, -74.0060),
('Industrial Area', 'SENSOR_P002', 45.8, 78.5, 480.0, 45.2, 50.5, 68.2, 120, 'Unhealthy for Sensitive', 135.0, 'Industrial emissions', TRUE, '2024-01-15 09:00:00', 40.7580, -74.0857),
('Downtown Plaza', 'SENSOR_P003', 35.2, 62.1, 425.0, 30.8, 42.0, 72.5, 95, 'Moderate', 105.0, 'Traffic congestion during rush hour', FALSE, '2024-01-15 10:00:00', 40.7505, -73.9934),
('Residential Zone A', 'SENSOR_P004', 15.2, 28.5, 395.0, 12.5, 28.0, 45.0, 55, 'Moderate', 60.0, 'Good air quality - low traffic', FALSE, '2024-01-15 11:00:00', 40.7282, -74.0776),
('Highway Intersection', 'SENSOR_P005', 55.5, 95.8, 520.0, 65.2, 58.5, 85.0, 150, 'Unhealthy', 165.0, 'Heavy vehicle traffic and exhaust', TRUE, '2024-01-15 12:00:00', 40.7614, -73.9776),
('Park Area', 'SENSOR_P006', 12.5, 22.3, 380.0, 8.5, 25.0, 40.0, 45, 'Good', 50.0, 'Excellent air quality - green area', FALSE, '2024-01-15 13:00:00', 40.7829, -73.9654),
('Shopping District', 'SENSOR_P007', 38.5, 68.2, 440.0, 35.5, 48.0, 70.0, 110, 'Unhealthy for Sensitive', 125.0, 'High pedestrian and vehicle traffic', FALSE, '2024-01-15 14:00:00', 40.7505, -73.9934),
('University Campus', 'SENSOR_P008', 20.8, 38.5, 400.0, 18.2, 32.0, 50.5, 65, 'Moderate', 70.0, 'Moderate traffic, good ventilation', FALSE, '2024-01-15 15:00:00', 40.8075, -73.9626);

-- Insert sample emergency incidents
INSERT INTO Incidents (incident_type, location, description, severity, reported_by, reporter_phone, status, latitude, longitude, reported_at) VALUES
('Fire', '123 Main Street', 'Smoke detected from 3rd floor apartment, possible kitchen fire', 'High', 'John Doe', '+1234567890', 'In Progress', 40.7128, -74.0060, '2024-01-15 08:30:00'),
('Medical', '456 Park Avenue', 'Elderly person collapsed, requires immediate medical attention', 'Critical', 'Sarah Smith', '+0987654321', 'Assigned', 40.7580, -74.0857, '2024-01-15 09:15:00'),
('Accident', 'Highway 101 at Exit 5', 'Two-vehicle collision, one person injured, traffic blocked', 'High', 'Mike Johnson', '+1122334455', 'Resolved', 40.7505, -73.9934, '2024-01-15 10:00:00'),
('Crime', '789 Downtown Plaza', 'Reported theft at retail store, suspect fled on foot', 'Medium', 'Emily Brown', '+5566778899', 'Assigned', 40.7282, -74.0776, '2024-01-15 11:20:00'),
('Medical', '321 Residential Street', 'Child having breathing difficulties, needs ambulance', 'Critical', 'David Wilson', '+9988776655', 'In Progress', 40.7614, -73.9776, '2024-01-15 12:45:00'),
('Fire', '555 Industrial Zone', 'Small fire in warehouse, fire department dispatched', 'Medium', 'Anonymous', NULL, 'Resolved', 40.7829, -73.9654, '2024-01-15 13:30:00'),
('Accident', 'City Center Boulevard', 'Minor fender bender, no injuries, vehicles blocking lane', 'Low', 'Lisa Anderson', '+2233445566', 'Resolved', 40.7505, -73.9934, '2024-01-15 14:15:00'),
('Crime', '999 Shopping Mall', 'Vandalism reported in parking area', 'Low', 'Robert Taylor', '+3344556677', 'Reported', 40.8075, -73.9626, '2024-01-15 15:00:00');

-- Insert sample response times
INSERT INTO ResponseTimes (incident_id, vehicle_id, dispatch_time, arrival_time, resolution_time, response_time_minutes, travel_distance_km, performance_rating, notes) VALUES
(1, 2, '2024-01-15 08:32:00', '2024-01-15 08:45:00', '2024-01-15 09:30:00', 13, 5.2, 'Excellent', 'Quick response, fire extinguished successfully'),
(2, 3, '2024-01-15 09:17:00', '2024-01-15 09:28:00', '2024-01-15 10:15:00', 11, 4.8, 'Excellent', 'Patient stabilized and transported to hospital'),
(3, 1, '2024-01-15 10:02:00', '2024-01-15 10:18:00', '2024-01-15 11:00:00', 16, 6.5, 'Good', 'Accident cleared, traffic restored'),
(4, 1, '2024-01-15 11:22:00', '2024-01-15 11:35:00', '2024-01-15 12:00:00', 13, 3.2, 'Excellent', 'Investigation ongoing'),
(5, 3, '2024-01-15 12:47:00', '2024-01-15 13:05:00', NULL, 18, 7.8, 'Good', 'Patient receiving treatment'),
(6, 2, '2024-01-15 13:32:00', '2024-01-15 13:48:00', '2024-01-15 14:20:00', 16, 5.5, 'Good', 'Fire contained and extinguished'),
(7, 1, '2024-01-15 14:17:00', '2024-01-15 14:25:00', '2024-01-15 14:45:00', 8, 2.1, 'Excellent', 'Quick resolution, vehicles moved'),
(8, 1, '2024-01-15 15:02:00', NULL, NULL, NULL, NULL, 'Good', 'Officer dispatched, investigation in progress');

