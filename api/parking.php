<?php
/**
 * Feature 2: Smart Parking System API
 * CRUD Operations for ParkingSpots and Reservations
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if (!$conn) {
    sendResponse(false, "Database connection failed", null, 500);
}

$action = $_GET['action'] ?? 'spots';

if ($action === 'spots') {
    // Parking Spots CRUD
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                $stmt = $conn->prepare("SELECT * FROM ParkingSpots WHERE spot_id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                
                if ($data) {
                    sendResponse(true, "Parking spot retrieved successfully", $data);
                } else {
                    sendResponse(false, "Parking spot not found", null, 404);
                }
            } else {
                $available = $_GET['available'] ?? null;
                $zone = $_GET['zone'] ?? null;
                
                $query = "SELECT * FROM ParkingSpots WHERE 1=1";
                $params = [];
                
                if ($available !== null) {
                    $query .= " AND is_available = ?";
                    $params[] = $available === 'true' ? 1 : 0;
                }
                if ($zone) {
                    $query .= " AND zone = ?";
                    $params[] = $zone;
                }
                
                $query .= " ORDER BY location, spot_number";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                
                sendResponse(true, "Parking spots retrieved successfully", $data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $location = $input['location'] ?? null;
            $spot_number = $input['spot_number'] ?? null;
            $zone = $input['zone'] ?? null;
            $capacity = $input['capacity'] ?? 1;
            $is_available = $input['is_available'] ?? true;
            $spot_type = $input['spot_type'] ?? 'Standard';
            $hourly_rate = $input['hourly_rate'] ?? 0.00;
            $latitude = $input['latitude'] ?? null;
            $longitude = $input['longitude'] ?? null;
            
            if (!$location || !$spot_number) {
                sendResponse(false, "Location and spot number are required", null, 400);
            }
            
            $stmt = $conn->prepare("INSERT INTO ParkingSpots (location, spot_number, zone, capacity, is_available, spot_type, hourly_rate, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            if ($stmt->execute([$location, $spot_number, $zone, $capacity, $is_available ? 1 : 0, $spot_type, $hourly_rate, $latitude, $longitude])) {
                $id = $conn->lastInsertId();
                sendResponse(true, "Parking spot created successfully", ['spot_id' => $id], 201);
            } else {
                sendResponse(false, "Failed to create parking spot", null, 500);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['spot_id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Spot ID is required", null, 400);
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['location', 'spot_number', 'zone', 'capacity', 'is_available', 'spot_type', 'hourly_rate', 'latitude', 'longitude'];
            
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
            $query = "UPDATE ParkingSpots SET " . implode(', ', $fields) . " WHERE spot_id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute($params)) {
                sendResponse(true, "Parking spot updated successfully", null);
            } else {
                sendResponse(false, "Failed to update parking spot", null, 500);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Spot ID is required", null, 400);
            }
            
            $stmt = $conn->prepare("DELETE FROM ParkingSpots WHERE spot_id = ?");
            
            if ($stmt->execute([$id])) {
                sendResponse(true, "Parking spot deleted successfully", null);
            } else {
                sendResponse(false, "Failed to delete parking spot", null, 500);
            }
            break;
    }
} else if ($action === 'reservations') {
    // Reservations CRUD
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                $stmt = $conn->prepare("SELECT r.*, p.location, p.spot_number FROM Reservations r JOIN ParkingSpots p ON r.spot_id = p.spot_id WHERE r.reservation_id = ?");
                $stmt->execute([$id]);
                $data = $stmt->fetch();
                
                if ($data) {
                    sendResponse(true, "Reservation retrieved successfully", $data);
                } else {
                    sendResponse(false, "Reservation not found", null, 404);
                }
            } else {
                $email = $_GET['email'] ?? null;
                $status = $_GET['status'] ?? null;
                
                $query = "SELECT r.*, p.location, p.spot_number FROM Reservations r JOIN ParkingSpots p ON r.spot_id = p.spot_id WHERE 1=1";
                $params = [];
                
                if ($email) {
                    $query .= " AND r.user_email = ?";
                    $params[] = $email;
                }
                if ($status) {
                    $query .= " AND r.status = ?";
                    $params[] = $status;
                }
                
                $query .= " ORDER BY r.start_time DESC";
                $stmt = $conn->prepare($query);
                $stmt->execute($params);
                $data = $stmt->fetchAll();
                
                sendResponse(true, "Reservations retrieved successfully", $data);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $spot_id = $input['spot_id'] ?? null;
            $user_name = $input['user_name'] ?? null;
            $user_email = $input['user_email'] ?? null;
            $user_phone = $input['user_phone'] ?? null;
            $start_time = $input['start_time'] ?? null;
            $end_time = $input['end_time'] ?? null;
            $vehicle_plate = $input['vehicle_plate'] ?? null;
            
            if (!$spot_id || !$user_name || !$user_email || !$start_time || !$end_time) {
                sendResponse(false, "Missing required fields", null, 400);
            }
            
            // Check if spot is available
            $stmt = $conn->prepare("SELECT is_available, hourly_rate FROM ParkingSpots WHERE spot_id = ?");
            $stmt->execute([$spot_id]);
            $spot = $stmt->fetch();
            
            if (!$spot) {
                sendResponse(false, "Parking spot not found", null, 404);
            }
            
            if (!$spot['is_available']) {
                sendResponse(false, "Parking spot is not available", null, 400);
            }
            
            // Check for conflicts
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM Reservations WHERE spot_id = ? AND status IN ('Pending', 'Confirmed', 'Active') AND ((start_time <= ? AND end_time >= ?) OR (start_time <= ? AND end_time >= ?))");
            $stmt->execute([$spot_id, $start_time, $start_time, $end_time, $end_time]);
            $conflict = $stmt->fetch();
            
            if ($conflict['count'] > 0) {
                sendResponse(false, "Time slot conflict with existing reservation", null, 400);
            }
            
            // Calculate amount
            $start = new DateTime($start_time);
            $end = new DateTime($end_time);
            $hours = $end->diff($start)->h + ($end->diff($start)->days * 24);
            $total_amount = $hours * $spot['hourly_rate'];
            
            $stmt = $conn->prepare("INSERT INTO Reservations (spot_id, user_name, user_email, user_phone, start_time, end_time, vehicle_plate, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
            
            if ($stmt->execute([$spot_id, $user_name, $user_email, $user_phone, $start_time, $end_time, $vehicle_plate, $total_amount])) {
                $id = $conn->lastInsertId();
                sendResponse(true, "Reservation created successfully", ['reservation_id' => $id, 'total_amount' => $total_amount], 201);
            } else {
                sendResponse(false, "Failed to create reservation", null, 500);
            }
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['reservation_id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Reservation ID is required", null, 400);
            }
            
            $fields = [];
            $params = [];
            $allowedFields = ['status', 'payment_status', 'start_time', 'end_time', 'vehicle_plate'];
            
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
            $query = "UPDATE Reservations SET " . implode(', ', $fields) . " WHERE reservation_id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute($params)) {
                sendResponse(true, "Reservation updated successfully", null);
            } else {
                sendResponse(false, "Failed to update reservation", null, 500);
            }
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            
            if (!$id) {
                sendResponse(false, "Reservation ID is required", null, 400);
            }
            
            $stmt = $conn->prepare("DELETE FROM Reservations WHERE reservation_id = ?");
            
            if ($stmt->execute([$id])) {
                sendResponse(true, "Reservation deleted successfully", null);
            } else {
                sendResponse(false, "Failed to delete reservation", null, 500);
            }
            break;
    }
}

?>

