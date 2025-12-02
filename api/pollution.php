<?php
/**
 * Feature 5: Air Quality & Pollution Monitoring API (AI-Based)
 * CRUD Operations for PollutionData
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if (!$conn) {
    sendResponse(false, "Database connection failed", null, 500);
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
            $stmt = $conn->prepare("SELECT * FROM PollutionData WHERE pollution_id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            
            if ($data) {
                sendResponse(true, "Pollution data retrieved successfully", $data);
            } else {
                sendResponse(false, "Pollution data not found", null, 404);
            }
        } else {
            $location = $_GET['location'] ?? null;
            $quality_status = $_GET['quality_status'] ?? null;
            $alert = $_GET['alert'] ?? null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            
            $query = "SELECT * FROM PollutionData WHERE 1=1";
            $params = [];
            
            if ($location) {
                $query .= " AND location LIKE ?";
                $params[] = "%$location%";
            }
            if ($quality_status) {
                $query .= " AND quality_status = ?";
                $params[] = $quality_status;
            }
            if ($alert !== null) {
                $query .= " AND alert_issued = ?";
                $params[] = $alert === 'true' ? 1 : 0;
            }
            
            $query .= " ORDER BY reading_date DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            
            sendResponse(true, "Pollution data retrieved successfully", $data);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        $location = $input['location'] ?? null;
        $sensor_id = $input['sensor_id'] ?? null;
        $pm25 = $input['pm25'] ?? null;
        $pm10 = $input['pm10'] ?? null;
        $co2_ppm = $input['co2_ppm'] ?? null;
        $no2_ppb = $input['no2_ppb'] ?? null;
        $o3_ppb = $input['o3_ppb'] ?? null;
        $noise_level_db = $input['noise_level_db'] ?? null;
        $air_quality_index = $input['air_quality_index'] ?? null;
        $quality_status = $input['quality_status'] ?? 'Good';
        $predicted_level = $input['predicted_level'] ?? null;
        $cause_identified = $input['cause_identified'] ?? null;
        $alert_issued = $input['alert_issued'] ?? false;
        $reading_date = $input['reading_date'] ?? date('Y-m-d H:i:s');
        $latitude = $input['latitude'] ?? null;
        $longitude = $input['longitude'] ?? null;
        
        if (!$location) {
            sendResponse(false, "Location is required", null, 400);
        }
        
        // AI-based AQI calculation if not provided
        if (!$air_quality_index && $pm25) {
            // Enhanced AI prediction algorithm
            $baseAQI = 0;
            
            // PM2.5 contribution (primary factor)
            if ($pm25 <= 12) {
                $baseAQI = 50;
            } elseif ($pm25 <= 35.4) {
                $baseAQI = 50 + (($pm25 - 12) / (35.4 - 12)) * 50;
            } elseif ($pm25 <= 55.4) {
                $baseAQI = 100 + (($pm25 - 35.4) / (55.4 - 35.4)) * 50;
            } elseif ($pm25 <= 150.4) {
                $baseAQI = 150 + (($pm25 - 55.4) / (150.4 - 55.4)) * 50;
            } elseif ($pm25 <= 250.4) {
                $baseAQI = 200 + (($pm25 - 150.4) / (250.4 - 150.4)) * 100;
            } else {
                $baseAQI = 300 + min((($pm25 - 250.4) / 100) * 100, 200);
            }
            
            // PM10 adjustment
            if ($pm10) {
                $pm10Factor = min($pm10 / 100, 1.2);
                $baseAQI = $baseAQI * (1 + ($pm10Factor - 1) * 0.3);
            }
            
            // CO2 adjustment
            if ($co2_ppm) {
                $co2Factor = ($co2_ppm > 450) ? 1.1 : 1.0;
                $baseAQI = $baseAQI * $co2Factor;
            }
            
            // Time-based factor (rush hour = higher pollution)
            $hour = (int)date('H', strtotime($reading_date));
            $timeFactor = ($hour >= 7 && $hour <= 9) || ($hour >= 17 && $hour <= 19) ? 1.15 : 1.0;
            $air_quality_index = round($baseAQI * $timeFactor);
            
            // Determine quality status
            if ($air_quality_index <= 50) {
                $quality_status = 'Good';
            } elseif ($air_quality_index <= 100) {
                $quality_status = 'Moderate';
            } elseif ($air_quality_index <= 150) {
                $quality_status = 'Unhealthy for Sensitive';
            } elseif ($air_quality_index <= 200) {
                $quality_status = 'Unhealthy';
            } elseif ($air_quality_index <= 300) {
                $quality_status = 'Very Unhealthy';
            } else {
                $quality_status = 'Hazardous';
            }
            
            // Auto-alert for high pollution
            if ($air_quality_index > 150 && !$alert_issued) {
                $alert_issued = true;
            }
            
            // AI prediction for next reading (if not provided)
            if (!$predicted_level) {
                // Simple prediction: current + trend
                $predicted_level = $air_quality_index * 1.1; // Slight increase prediction
            }
        }
        
        $stmt = $conn->prepare("INSERT INTO PollutionData (location, sensor_id, pm25, pm10, co2_ppm, no2_ppb, o3_ppb, noise_level_db, air_quality_index, quality_status, predicted_level, cause_identified, alert_issued, reading_date, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$location, $sensor_id, $pm25, $pm10, $co2_ppm, $no2_ppb, $o3_ppb, $noise_level_db, $air_quality_index, $quality_status, $predicted_level, $cause_identified, $alert_issued ? 1 : 0, $reading_date, $latitude, $longitude])) {
            $id = $conn->lastInsertId();
            sendResponse(true, "Pollution data created successfully", ['pollution_id' => $id], 201);
        } else {
            sendResponse(false, "Failed to create pollution data", null, 500);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['pollution_id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Pollution ID is required", null, 400);
        }
        
        $fields = [];
        $params = [];
        $allowedFields = ['location', 'sensor_id', 'pm25', 'pm10', 'co2_ppm', 'no2_ppb', 'o3_ppb', 'noise_level_db', 'air_quality_index', 'quality_status', 'predicted_level', 'cause_identified', 'alert_issued', 'reading_date', 'latitude', 'longitude'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            sendResponse(false, "No fields to update", null, 400);
        }
        
        $params[] = $id;
        $query = "UPDATE PollutionData SET " . implode(', ', $fields) . " WHERE pollution_id = ?";
        $stmt = $conn->prepare($query);
        
        if ($stmt->execute($params)) {
            sendResponse(true, "Pollution data updated successfully", null);
        } else {
            sendResponse(false, "Failed to update pollution data", null, 500);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? $_GET['id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Pollution ID is required", null, 400);
        }
        
        $stmt = $conn->prepare("DELETE FROM PollutionData WHERE pollution_id = ?");
        
        if ($stmt->execute([$id])) {
            sendResponse(true, "Pollution data deleted successfully", null);
        } else {
            sendResponse(false, "Failed to delete pollution data", null, 500);
        }
        break;

    default:
        sendResponse(false, "Method not allowed", null, 405);
        break;
}

?>

