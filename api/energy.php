<?php
/**
 * Feature 4: Smart Energy Monitoring System API
 * CRUD Operations for EnergyUsage
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
            $stmt = $conn->prepare("SELECT * FROM EnergyUsage WHERE usage_id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch();
            
            if ($data) {
                sendResponse(true, "Energy usage data retrieved successfully", $data);
            } else {
                sendResponse(false, "Energy usage data not found", null, 404);
            }
        } else {
            $location = $_GET['location'] ?? null;
            $consumer_type = $_GET['consumer_type'] ?? null;
            $meter_id = $_GET['meter_id'] ?? null;
            $anomaly = $_GET['anomaly'] ?? null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            
            $query = "SELECT * FROM EnergyUsage WHERE 1=1";
            $params = [];
            
            if ($location) {
                $query .= " AND location LIKE ?";
                $params[] = "%$location%";
            }
            if ($consumer_type) {
                $query .= " AND consumer_type = ?";
                $params[] = $consumer_type;
            }
            if ($meter_id) {
                $query .= " AND meter_id = ?";
                $params[] = $meter_id;
            }
            if ($anomaly !== null) {
                $query .= " AND anomaly_detected = ?";
                $params[] = $anomaly === 'true' ? 1 : 0;
            }
            
            $query .= " ORDER BY reading_date DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll();
            
            sendResponse(true, "Energy usage data retrieved successfully", $data);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        $location = $input['location'] ?? null;
        $consumer_type = $input['consumer_type'] ?? null;
        $meter_id = $input['meter_id'] ?? null;
        $energy_kwh = $input['energy_kwh'] ?? 0.00;
        $water_liters = $input['water_liters'] ?? 0.00;
        $gas_m3 = $input['gas_m3'] ?? 0.00;
        $reading_date = $input['reading_date'] ?? date('Y-m-d H:i:s');
        $cost_usd = $input['cost_usd'] ?? 0.00;
        $anomaly_detected = $input['anomaly_detected'] ?? false;
        $anomaly_details = $input['anomaly_details'] ?? null;
        
        if (!$location || !$consumer_type || !$meter_id) {
            sendResponse(false, "Location, consumer type, and meter ID are required", null, 400);
        }
        
        $stmt = $conn->prepare("INSERT INTO EnergyUsage (location, consumer_type, meter_id, energy_kwh, water_liters, gas_m3, reading_date, cost_usd, anomaly_detected, anomaly_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$location, $consumer_type, $meter_id, $energy_kwh, $water_liters, $gas_m3, $reading_date, $cost_usd, $anomaly_detected ? 1 : 0, $anomaly_details])) {
            $id = $conn->lastInsertId();
            sendResponse(true, "Energy usage data created successfully", ['usage_id' => $id], 201);
        } else {
            sendResponse(false, "Failed to create energy usage data", null, 500);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['usage_id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Usage ID is required", null, 400);
        }
        
        $fields = [];
        $params = [];
        $allowedFields = ['location', 'consumer_type', 'meter_id', 'energy_kwh', 'water_liters', 'gas_m3', 'reading_date', 'cost_usd', 'anomaly_detected', 'anomaly_details'];
        
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
        $query = "UPDATE EnergyUsage SET " . implode(', ', $fields) . " WHERE usage_id = ?";
        $stmt = $conn->prepare($query);
        
        if ($stmt->execute($params)) {
            sendResponse(true, "Energy usage data updated successfully", null);
        } else {
            sendResponse(false, "Failed to update energy usage data", null, 500);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? $_GET['id'] ?? null;
        
        if (!$id) {
            sendResponse(false, "Usage ID is required", null, 400);
        }
        
        $stmt = $conn->prepare("DELETE FROM EnergyUsage WHERE usage_id = ?");
        
        if ($stmt->execute([$id])) {
            sendResponse(true, "Energy usage data deleted successfully", null);
        } else {
            sendResponse(false, "Failed to delete energy usage data", null, 500);
        }
        break;

    default:
        sendResponse(false, "Method not allowed", null, 405);
        break;
}

?>

