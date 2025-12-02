<?php
/**
 * Feature 1: Smart City Traffic Management API
 * CRUD Operations for TrafficData
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if (!$conn) {
    sendResponse(false, "Database connection failed", null, 500);
}

switch ($method) {
    case 'GET':
        // Read - Get all traffic data or by ID
        if (isset($_GET['id'])) {
            $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
            $stmt = $conn->prepare("SELECT * FROM TrafficData WHERE traffic_id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            
            if ($data) {
                sendResponse(true, "Traffic data retrieved successfully", $data);
            } else {
                sendResponse(false, "Traffic data not found", null, 404);
            }
        } else {
            // Get all with optional filters
            $location = $_GET['location'] ?? null;
            $congestion = $_GET['congestion'] ?? null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            
            $query = "SELECT * FROM TrafficData WHERE 1=1";
            $params = [];
            
            if ($location) {
                $query .= " AND location LIKE ?";
                $params[] = "%$location%";
            }
            if ($congestion) {
                $query .= " AND congestion_level = ?";
                $params[] = $congestion;
            }
            
            $query .= " ORDER BY timestamp DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            
            sendResponse(true, "Traffic data retrieved successfully", $data);
        }
        break;

    case 'POST':
        // Create - Add new traffic data
        $input = json_decode(file_get_contents('php://input'), true);
        
        $location = $input['location'] ?? null;
        $vehicle_count = $input['vehicle_count'] ?? 0;
        $congestion_level = $input['congestion_level'] ?? 'Low';
        $accident_reported = $input['accident_reported'] ?? false;
        $accident_details = $input['accident_details'] ?? null;
        $route_name = $input['route_name'] ?? null;
        $sensor_id = $input['sensor_id'] ?? null;
        $speed_avg = $input['speed_avg'] ?? null;
        $timestamp = $input['timestamp'] ?? date('Y-m-d H:i:s');
        
        if (!$location) {
            sendResponse(false, "Location is required", null, 400);
        }
        
        $stmt = $conn->prepare("INSERT INTO TrafficData (location, vehicle_count, congestion_level, accident_reported, accident_details, route_name, sensor_id, speed_avg, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$location, $vehicle_count, $congestion_level, $accident_reported ? 1 : 0, $accident_details, $route_name, $sensor_id, $speed_avg, $timestamp])) {
            $id = $conn->lastInsertId();
            sendResponse(true, "Traffic data created successfully", ['traffic_id' => $id], 201);
        } else {
            sendResponse(false, "Failed to create traffic data", null, 500);
        }
        break;

    case 'PUT':
        // Update - Update existing traffic data
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['traffic_id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Traffic ID is required", null, 400);
        }
        
        $fields = [];
        $params = [];
        
        $allowedFields = ['location', 'vehicle_count', 'congestion_level', 'accident_reported', 'accident_details', 'route_name', 'sensor_id', 'speed_avg', 'timestamp'];
        
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
        $query = "UPDATE TrafficData SET " . implode(', ', $fields) . " WHERE traffic_id = ?";
        $stmt = $conn->prepare($query);
        
        if ($stmt->execute($params)) {
            sendResponse(true, "Traffic data updated successfully", null);
        } else {
            sendResponse(false, "Failed to update traffic data", null, 500);
        }
        break;

    case 'DELETE':
        // Delete - Remove traffic data
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? $_GET['id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Traffic ID is required", null, 400);
        }
        
        $stmt = $conn->prepare("DELETE FROM TrafficData WHERE traffic_id = ?");
        
        if ($stmt->execute([$id])) {
            sendResponse(true, "Traffic data deleted successfully", null);
        } else {
            sendResponse(false, "Failed to delete traffic data", null, 500);
        }
        break;

    default:
        sendResponse(false, "Method not allowed", null, 405);
        break;
}

?>

