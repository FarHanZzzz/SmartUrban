# API Documentation - Smart Urban Development Project

## Base URL

All API endpoints are relative to: `/api/`

## Response Format

All API responses follow this format:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

## Error Responses

```json
{
    "success": false,
    "message": "Error message",
    "data": null
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 1. Traffic Management API

### Get All Traffic Data

**Endpoint:** `GET /api/traffic.php`

**Query Parameters:**
- `location` (optional) - Filter by location
- `congestion` (optional) - Filter by congestion level (Low, Medium, High, Severe)
- `limit` (optional) - Limit results (default: 100)

**Example Request:**
```
GET /api/traffic.php?location=Downtown&congestion=High&limit=50
```

**Example Response:**
```json
{
    "success": true,
    "message": "Traffic data retrieved successfully",
    "data": [
        {
            "traffic_id": 1,
            "location": "Downtown Main St",
            "vehicle_count": 150,
            "congestion_level": "High",
            "accident_reported": 0,
            "route_name": "Route A",
            "timestamp": "2024-01-15 10:30:00"
        }
    ]
}
```

### Get Single Traffic Record

**Endpoint:** `GET /api/traffic.php?id={id}`

**Example:**
```
GET /api/traffic.php?id=1
```

### Create Traffic Data

**Endpoint:** `POST /api/traffic.php`

**Request Body:**
```json
{
    "location": "Downtown Main St",
    "vehicle_count": 150,
    "congestion_level": "High",
    "accident_reported": false,
    "accident_details": null,
    "route_name": "Route A",
    "sensor_id": "SENSOR001",
    "speed_avg": 45.5,
    "timestamp": "2024-01-15 10:30:00"
}
```

### Update Traffic Data

**Endpoint:** `PUT /api/traffic.php`

**Request Body:**
```json
{
    "traffic_id": 1,
    "location": "Updated Location",
    "vehicle_count": 200,
    "congestion_level": "Severe"
}
```

### Delete Traffic Data

**Endpoint:** `DELETE /api/traffic.php`

**Request Body:**
```json
{
    "id": 1
}
```

---

## 2. Parking System API

### Parking Spots

#### Get All Parking Spots

**Endpoint:** `GET /api/parking.php?action=spots`

**Query Parameters:**
- `available` (optional) - Filter by availability (true/false)
- `zone` (optional) - Filter by zone

**Example:**
```
GET /api/parking.php?action=spots&available=true&zone=Zone A
```

#### Create Parking Spot

**Endpoint:** `POST /api/parking.php?action=spots`

**Request Body:**
```json
{
    "location": "Downtown Plaza",
    "spot_number": "P001",
    "zone": "Zone A",
    "capacity": 1,
    "is_available": true,
    "spot_type": "Standard",
    "hourly_rate": 2.50,
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

#### Update Parking Spot

**Endpoint:** `PUT /api/parking.php?action=spots`

**Request Body:**
```json
{
    "spot_id": 1,
    "is_available": false,
    "hourly_rate": 3.00
}
```

#### Delete Parking Spot

**Endpoint:** `DELETE /api/parking.php?action=spots`

**Request Body:**
```json
{
    "id": 1
}
```

### Reservations

#### Get All Reservations

**Endpoint:** `GET /api/parking.php?action=reservations`

**Query Parameters:**
- `email` (optional) - Filter by user email
- `status` (optional) - Filter by status

**Example:**
```
GET /api/parking.php?action=reservations&email=user@example.com
```

#### Create Reservation

**Endpoint:** `POST /api/parking.php?action=reservations`

**Request Body:**
```json
{
    "spot_id": 1,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "+1234567890",
    "start_time": "2024-01-15 10:00:00",
    "end_time": "2024-01-15 12:00:00",
    "vehicle_plate": "ABC123"
}
```

#### Update Reservation

**Endpoint:** `PUT /api/parking.php?action=reservations`

**Request Body:**
```json
{
    "reservation_id": 1,
    "status": "Confirmed",
    "payment_status": "Paid"
}
```

---

## 3. Waste Management API

### Collections

**Endpoint:** `GET /api/waste.php?action=collection`

**Query Parameters:**
- `status` (optional) - Filter by collection status

### Waste Types

**Endpoint:** `GET /api/waste.php?action=waste-types`

**Query Parameters:**
- `category` (optional) - Filter by category

### Recycling Plants

**Endpoint:** `GET /api/waste.php?action=plants`

### Transportation

**Endpoint:** `GET /api/waste.php?action=transportation`

**Example Request:**
```
POST /api/waste.php?action=collection
```

**Request Body:**
```json
{
    "waste_type_id": 1,
    "location": "Downtown Area",
    "bin_id": "BIN001",
    "fill_level": 75,
    "collection_status": "Scheduled",
    "scheduled_date": "2024-01-15 08:00:00",
    "weight_kg": 150.5,
    "collector_name": "John Smith"
}
```

---

## 4. Energy Monitoring API

### Get Energy Data

**Endpoint:** `GET /api/energy.php`

**Query Parameters:**
- `location` (optional) - Filter by location
- `consumer_type` (optional) - Filter by type (Household, Industrial, Commercial, Public)
- `meter_id` (optional) - Filter by meter ID
- `anomaly` (optional) - Filter by anomaly (true/false)
- `limit` (optional) - Limit results

**Example:**
```
GET /api/energy.php?consumer_type=Household&anomaly=true
```

### Create Energy Record

**Endpoint:** `POST /api/energy.php`

**Request Body:**
```json
{
    "location": "Residential Building A",
    "consumer_type": "Household",
    "meter_id": "METER001",
    "energy_kwh": 150.5,
    "water_liters": 500.0,
    "gas_m3": 25.5,
    "reading_date": "2024-01-15 00:00:00",
    "cost_usd": 45.75,
    "anomaly_detected": false,
    "anomaly_details": null
}
```

---

## 5. Pollution Monitoring API

### Get Pollution Data

**Endpoint:** `GET /api/pollution.php`

**Query Parameters:**
- `location` (optional) - Filter by location
- `quality_status` (optional) - Filter by quality status
- `alert` (optional) - Filter by alert status (true/false)
- `limit` (optional) - Limit results

**Example:**
```
GET /api/pollution.php?quality_status=Unhealthy&alert=true
```

### Create Pollution Record

**Endpoint:** `POST /api/pollution.php`

**Request Body:**
```json
{
    "location": "City Center",
    "sensor_id": "SENSOR001",
    "pm25": 35.5,
    "pm10": 55.2,
    "co2_ppm": 420.0,
    "no2_ppb": 25.5,
    "o3_ppb": 45.0,
    "noise_level_db": 65.5,
    "air_quality_index": 120,
    "quality_status": "Moderate",
    "predicted_level": 130,
    "cause_identified": "Traffic congestion",
    "alert_issued": false,
    "reading_date": "2024-01-15 12:00:00",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

**Note:** If `air_quality_index` is not provided, it will be calculated based on PM2.5 value.

---

## 6. Emergency Response API

### Incidents

#### Get All Incidents

**Endpoint:** `GET /api/emergency.php?action=incidents`

**Query Parameters:**
- `type` (optional) - Filter by incident type
- `status` (optional) - Filter by status
- `severity` (optional) - Filter by severity

**Example:**
```
GET /api/emergency.php?action=incidents&type=Fire&severity=High
```

#### Create Incident

**Endpoint:** `POST /api/emergency.php?action=incidents`

**Request Body:**
```json
{
    "incident_type": "Fire",
    "location": "123 Main Street",
    "description": "Building fire reported",
    "severity": "High",
    "reported_by": "John Doe",
    "reporter_phone": "+1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

### Emergency Vehicles

#### Get All Vehicles

**Endpoint:** `GET /api/emergency.php?action=vehicles`

**Query Parameters:**
- `type` (optional) - Filter by vehicle type
- `status` (optional) - Filter by status

#### Create Vehicle

**Endpoint:** `POST /api/emergency.php?action=vehicles`

**Request Body:**
```json
{
    "vehicle_type": "Fire",
    "vehicle_number": "FIR-001",
    "current_location": "Fire Station Central",
    "status": "Available",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

### Response Times

#### Get All Response Times

**Endpoint:** `GET /api/emergency.php?action=responses`

**Query Parameters:**
- `incident_id` (optional) - Filter by incident
- `vehicle_id` (optional) - Filter by vehicle

#### Create Response Time

**Endpoint:** `POST /api/emergency.php?action=responses`

**Request Body:**
```json
{
    "incident_id": 1,
    "vehicle_id": 1,
    "dispatch_time": "2024-01-15 10:00:00",
    "arrival_time": "2024-01-15 10:15:00",
    "resolution_time": "2024-01-15 11:00:00",
    "travel_distance_km": 5.5,
    "performance_rating": "Good"
}
```

**Note:** `response_time_minutes` is automatically calculated from `dispatch_time` and `arrival_time`.

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

```json
{
    "success": false,
    "message": "Error description",
    "data": null
}
```

Common errors:
- `400` - Missing required fields
- `404` - Record not found
- `500` - Database or server error

---

## Rate Limiting

Currently, there are no rate limits. For production, implement:
- Request throttling
- API key authentication
- Rate limiting per IP/user

---

## CORS

CORS is enabled for all origins. For production:
- Restrict to specific domains
- Use proper authentication
- Implement CSRF protection

---

## Testing

### Using cURL

```bash
# Get all traffic data
curl http://localhost/SmartUrban/api/traffic.php

# Create traffic record
curl -X POST http://localhost/SmartUrban/api/traffic.php \
  -H "Content-Type: application/json" \
  -d '{"location":"Test Location","vehicle_count":100}'
```

### Using Postman

1. Import collection (if available)
2. Set base URL: `http://localhost/SmartUrban/api/`
3. Set headers: `Content-Type: application/json`
4. Test endpoints

---

**Last Updated:** 2024

