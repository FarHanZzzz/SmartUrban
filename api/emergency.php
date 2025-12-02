<?php
/**
 * Feature 6: Emergency Response & Public Safety System API
 * CRUD Operations for Incidents, EmergencyVehicles, ResponseTimes
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if (!$conn) {
    sendResponse(false, "Database connection failed", null, 500);
}

$action = $_GET['action'] ?? 'incidents';

if ($action === 'incidents') {
    // Incidents CRUD
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                $stmt = $conn->prepare("SELECT i.*, ev.vehicle_number, ev.vehicle_type FROM Incidents i LEFT JOIN EmergencyVehicles ev ON i.assigned_vehicle_id = ev.vehicle_id WHERE i.incident_id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                
                if ($data) {
                    sendResponse(true, "Incident retrieved successfully", $data);
                } else {
                    sendResponse(false, "Incident not found", null, 404);
                }
            } else {
                $type = $_GET['type'] ?? null;
                $status = $_GET['status'] ?? null;
                $severity = $_GET['severity'] ?? null;
                
                $query = "SELECT i.*, ev.vehicle_number, ev.vehicle_type FROM Incidents i LEFT JOIN EmergencyVehicles ev ON i.assigned_vehicle_id = ev.vehicle_id WHERE 1=1";
                $params = [];
                
                if ($type) {
                    $query .= " AND i.incident_type = ?";
                    $params[] = $type;
                }
                if ($status) {
                    $query .= " AND i.status = ?";
                    $params[] = $status;
                }
                if ($severity) {
                    $query .= " AND i.severity = ?";
                    $params[] = $severity;
                }
                
                $query .= " ORDER BY i.reported_at DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                
                sendResponse(true, "Incidents retrieved successfully", $data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $incident_type = $input['incident_type'] ?? null;
            $location = $input['location'] ?? null;
            $description = $input['description'] ?? null;
            $severity = $input['severity'] ?? 'Medium';
            $reported_by = $input['reported_by'] ?? null;
            $reporter_phone = $input['reporter_phone'] ?? null;
            $latitude = $input['latitude'] ?? null;
            $longitude = $input['longitude'] ?? null;
            
            if (!$incident_type || !$location || !$description) {
                sendResponse(false, "Incident type, location, and description are required", null, 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO Incidents (incident_type, location, description, severity, reported_by, reporter_phone, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            if ($stmt->execute([$incident_type, $location, $description, $severity, $reported_by, $reporter_phone, $latitude, $longitude])) {
                $id = $conn->lastInsertId();
                sendResponse(true, "Incident created successfully", ['incident_id' => $id], 201);
            } else {
                sendResponse(false, "Failed to create incident", null, 500);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['incident_id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Incident ID is required", null, 400);
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['incident_type', 'location', 'description', 'severity', 'status', 'reported_by', 'reporter_phone', 'assigned_vehicle_id', 'resolved_at', 'latitude', 'longitude'];
            
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
            $query = "UPDATE Incidents SET " . implode(', ', $fields) . " WHERE incident_id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute($params)) {
                sendResponse(true, "Incident updated successfully", null);
            } else {
                sendResponse(false, "Failed to update incident", null, 500);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Incident ID is required", null, 400);
            }
            
            $stmt = $conn->prepare("DELETE FROM Incidents WHERE incident_id = ?");
            
            if ($stmt->execute([$id])) {
                sendResponse(true, "Incident deleted successfully", null);
            } else {
                sendResponse(false, "Failed to delete incident", null, 500);
            }
            break;
    }
} else if ($action === 'vehicles') {
    // EmergencyVehicles CRUD
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                $stmt = $conn->prepare("SELECT ev.*, i.incident_type, i.location as incident_location FROM EmergencyVehicles ev LEFT JOIN Incidents i ON ev.assigned_incident_id = i.incident_id WHERE ev.vehicle_id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                
                if ($data) {
                    sendResponse(true, "Vehicle retrieved successfully", $data);
                } else {
                    sendResponse(false, "Vehicle not found", null, 404);
                }
            } else {
                $type = $_GET['type'] ?? null;
                $status = $_GET['status'] ?? null;
                
                $query = "SELECT ev.*, i.incident_type, i.location as incident_location FROM EmergencyVehicles ev LEFT JOIN Incidents i ON ev.assigned_incident_id = i.incident_id WHERE 1=1";
                $params = [];
                
                if ($type) {
                    $query .= " AND ev.vehicle_type = ?";
                    $params[] = $type;
                }
                if ($status) {
                    $query .= " AND ev.status = ?";
                    $params[] = $status;
                }
                
                $query .= " ORDER BY ev.vehicle_type, ev.vehicle_number";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                
                sendResponse(true, "Vehicles retrieved successfully", $data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $vehicle_type = $input['vehicle_type'] ?? null;
            $vehicle_number = $input['vehicle_number'] ?? null;
            $current_location = $input['current_location'] ?? null;
            $status = $input['status'] ?? 'Available';
            $latitude = $input['latitude'] ?? null;
            $longitude = $input['longitude'] ?? null;
            
            if (!$vehicle_type || !$vehicle_number) {
                sendResponse(false, "Vehicle type and number are required", null, 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO EmergencyVehicles (vehicle_type, vehicle_number, current_location, status, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)");
            
            if ($stmt->execute([$vehicle_type, $vehicle_number, $current_location, $status, $latitude, $longitude])) {
                $id = $conn->lastInsertId();
                sendResponse(true, "Vehicle created successfully", ['vehicle_id' => $id], 201);
            } else {
                sendResponse(false, "Failed to create vehicle", null, 500);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['vehicle_id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Vehicle ID is required", null, 400);
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['vehicle_type', 'vehicle_number', 'current_location', 'status', 'assigned_incident_id', 'latitude', 'longitude'];
            
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
            $query = "UPDATE EmergencyVehicles SET " . implode(', ', $fields) . " WHERE vehicle_id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute($params)) {
                sendResponse(true, "Vehicle updated successfully", null);
            } else {
                sendResponse(false, "Failed to update vehicle", null, 500);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Vehicle ID is required", null, 400);
            }
            
            $stmt = $conn->prepare("DELETE FROM EmergencyVehicles WHERE vehicle_id = ?");
            
            if ($stmt->execute([$id])) {
                sendResponse(true, "Vehicle deleted successfully", null);
            } else {
                sendResponse(false, "Failed to delete vehicle", null, 500);
            }
            break;
    }
} else if ($action === 'responses') {
    // ResponseTimes CRUD
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                $stmt = $conn->prepare("SELECT rt.*, i.incident_type, i.location, ev.vehicle_number, ev.vehicle_type FROM ResponseTimes rt JOIN Incidents i ON rt.incident_id = i.incident_id JOIN EmergencyVehicles ev ON rt.vehicle_id = ev.vehicle_id WHERE rt.response_id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                
                if ($data) {
                    sendResponse(true, "Response time retrieved successfully", $data);
                } else {
                    sendResponse(false, "Response time not found", null, 404);
                }
            } else {
                $incident_id = $_GET['incident_id'] ?? null;
                $vehicle_id = $_GET['vehicle_id'] ?? null;
                
                $query = "SELECT rt.*, i.incident_type, i.location, ev.vehicle_number, ev.vehicle_type FROM ResponseTimes rt JOIN Incidents i ON rt.incident_id = i.incident_id JOIN EmergencyVehicles ev ON rt.vehicle_id = ev.vehicle_id WHERE 1=1";
                $params = [];
                
                if ($incident_id) {
                    $query .= " AND rt.incident_id = ?";
                    $params[] = $incident_id;
                }
                if ($vehicle_id) {
                    $query .= " AND rt.vehicle_id = ?";
                    $params[] = $vehicle_id;
                }
                
                $query .= " ORDER BY rt.dispatch_time DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                
                sendResponse(true, "Response times retrieved successfully", $data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $incident_id = $input['incident_id'] ?? null;
            $vehicle_id = $input['vehicle_id'] ?? null;
            $dispatch_time = $input['dispatch_time'] ?? date('Y-m-d H:i:s');
            $arrival_time = $input['arrival_time'] ?? null;
            $resolution_time = $input['resolution_time'] ?? null;
            $travel_distance_km = $input['travel_distance_km'] ?? null;
            $performance_rating = $input['performance_rating'] ?? 'Good';
            
            if (!$incident_id || !$vehicle_id) {
                sendResponse(false, "Incident ID and Vehicle ID are required", null, 400);
            }
            
            // Calculate response time if arrival time is provided
            $response_time_minutes = null;
            if ($arrival_time && $dispatch_time) {
                $dispatch = new DateTime($dispatch_time);
                $arrival = new DateTime($arrival_time);
                $diff = $arrival->diff($dispatch);
                $response_time_minutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
            }
            
            $stmt = $conn->prepare("INSERT INTO ResponseTimes (incident_id, vehicle_id, dispatch_time, arrival_time, resolution_time, response_time_minutes, travel_distance_km, performance_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            if ($stmt->execute([$incident_id, $vehicle_id, $dispatch_time, $arrival_time, $resolution_time, $response_time_minutes, $travel_distance_km, $performance_rating])) {
                $id = $conn->lastInsertId();
                sendResponse(true, "Response time created successfully", ['response_id' => $id], 201);
            } else {
                sendResponse(false, "Failed to create response time", null, 500);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['response_id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Response ID is required", null, 400);
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['incident_id', 'vehicle_id', 'dispatch_time', 'arrival_time', 'resolution_time', 'travel_distance_km', 'performance_rating', 'notes'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            // Recalculate response time if arrival or dispatch time changed
            if (isset($input['arrival_time']) || isset($input['dispatch_time'])) {
                $stmt = $conn->prepare("SELECT dispatch_time, arrival_time FROM ResponseTimes WHERE response_id = ?");
                $stmt->execute([$id]);
                $current = $stmt->fetch();
                
                $dispatch = $input['dispatch_time'] ?? $current['dispatch_time'];
                $arrival = $input['arrival_time'] ?? $current['arrival_time'];
                
                if ($dispatch && $arrival) {
                    $d = new DateTime($dispatch);
                    $a = new DateTime($arrival);
                    $diff = $a->diff($d);
                    $response_time_minutes = ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
                    $fields[] = "response_time_minutes = ?";
                    $params[] = $response_time_minutes;
                }
            }
            
            if (empty($fields)) {
                sendResponse(false, "No fields to update", null, 400);
            }
            
            $params[] = $id;
            $query = "UPDATE ResponseTimes SET " . implode(', ', $fields) . " WHERE response_id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute($params)) {
                sendResponse(true, "Response time updated successfully", null);
            } else {
                sendResponse(false, "Failed to update response time", null, 500);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Response ID is required", null, 400);
            }
            
            $stmt = $conn->prepare("DELETE FROM ResponseTimes WHERE response_id = ?");
            
            if ($stmt->execute([$id])) {
                sendResponse(true, "Response time deleted successfully", null);
            } else {
                sendResponse(false, "Failed to delete response time", null, 500);
            }
            break;
    }
}

?>

