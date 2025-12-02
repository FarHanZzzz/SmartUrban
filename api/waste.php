<?php
/**
 * Feature 3: Waste Management & Recycling Tracking API
 * CRUD Operations for WasteTypes, Collection, RecyclingPlants, Transportation
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

if (!$conn) {
    sendResponse(false, "Database connection failed", null, 500);
}

$action = $_GET['action'] ?? 'collection';

switch ($action) {
    case 'waste-types':
        // WasteTypes CRUD
        switch ($method) {
            case 'GET':
                if (isset($_GET['id'])) {
                    $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
                    $stmt = $conn->prepare("SELECT * FROM WasteTypes WHERE waste_type_id = ?");
                    $stmt->execute([$id]);
                    $data = $stmt->fetch();
                    sendResponse($data ? true : false, $data ? "Waste type retrieved" : "Not found", $data, $data ? 200 : 404);
                } else {
                    $category = $_GET['category'] ?? null;
                    $query = "SELECT * FROM WasteTypes WHERE 1=1";
                    $params = [];
                    if ($category) {
                        $query .= " AND category = ?";
                        $params[] = $category;
                    }
                    $stmt = $conn->prepare($query);
                    $stmt->execute($params);
                    sendResponse(true, "Waste types retrieved", $stmt->fetchAll());
                }
                break;
            case 'POST':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("INSERT INTO WasteTypes (type_name, category, description, recycling_rate) VALUES (?, ?, ?, ?)");
                if ($stmt->execute([$input['type_name'], $input['category'], $input['description'] ?? null, $input['recycling_rate'] ?? 0])) {
                    sendResponse(true, "Waste type created", ['waste_type_id' => $conn->lastInsertId()], 201);
                } else {
                    sendResponse(false, "Failed to create", null, 500);
                }
                break;
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("UPDATE WasteTypes SET type_name=?, category=?, description=?, recycling_rate=? WHERE waste_type_id=?");
                if ($stmt->execute([$input['type_name'], $input['category'], $input['description'] ?? null, $input['recycling_rate'] ?? 0, $input['waste_type_id']])) {
                    sendResponse(true, "Updated successfully", null);
                } else {
                    sendResponse(false, "Update failed", null, 500);
                }
                break;
            case 'DELETE':
                $id = json_decode(file_get_contents('php://input'), true)['id'] ?? $_GET['id'] ?? null;
                $stmt = $conn->prepare("DELETE FROM WasteTypes WHERE waste_type_id = ?");
                sendResponse($stmt->execute([$id]), $stmt->execute([$id]) ? "Deleted" : "Failed", null);
                break;
        }
        break;

    case 'collection':
        // Collection CRUD
        switch ($method) {
            case 'GET':
                if (isset($_GET['id'])) {
                    $stmt = $conn->prepare("SELECT c.*, wt.type_name, wt.category FROM Collection c JOIN WasteTypes wt ON c.waste_type_id = wt.waste_type_id WHERE c.collection_id = ?");
                    $stmt->execute([$_GET['id']]);
                    $data = $stmt->fetch();
                    sendResponse($data ? true : false, $data ? "Retrieved" : "Not found", $data, $data ? 200 : 404);
                } else {
                    $status = $_GET['status'] ?? null;
                    $query = "SELECT c.*, wt.type_name, wt.category FROM Collection c JOIN WasteTypes wt ON c.waste_type_id = wt.waste_type_id WHERE 1=1";
                    $params = [];
                    if ($status) {
                        $query .= " AND c.collection_status = ?";
                        $params[] = $status;
                    }
                    $query .= " ORDER BY c.scheduled_date DESC";
                    $stmt = $conn->prepare($query);
                    $stmt->execute($params);
                    sendResponse(true, "Collections retrieved", $stmt->fetchAll());
                }
                break;
            case 'POST':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("INSERT INTO Collection (waste_type_id, location, bin_id, fill_level, collection_status, scheduled_date, weight_kg, collector_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                if ($stmt->execute([$input['waste_type_id'], $input['location'], $input['bin_id'] ?? null, $input['fill_level'] ?? 0, $input['collection_status'] ?? 'Scheduled', $input['scheduled_date'], $input['weight_kg'] ?? null, $input['collector_name'] ?? null])) {
                    sendResponse(true, "Collection created", ['collection_id' => $conn->lastInsertId()], 201);
                } else {
                    sendResponse(false, "Failed", null, 500);
                }
                break;
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true);
                $fields = [];
                $params = [];
                $allowed = ['waste_type_id', 'location', 'fill_level', 'collection_status', 'scheduled_date', 'collected_date', 'weight_kg', 'collector_name'];
                foreach ($allowed as $f) {
                    if (isset($input[$f])) {
                        $fields[] = "$f = ?";
                        $params[] = $input[$f];
                    }
                }
                $params[] = $input['collection_id'];
                $stmt = $conn->prepare("UPDATE Collection SET " . implode(', ', $fields) . " WHERE collection_id = ?");
                sendResponse($stmt->execute($params), "Updated", null);
                break;
            case 'DELETE':
                $id = json_decode(file_get_contents('php://input'), true)['id'] ?? $_GET['id'] ?? null;
                $stmt = $conn->prepare("DELETE FROM Collection WHERE collection_id = ?");
                sendResponse($stmt->execute([$id]), "Deleted", null);
                break;
        }
        break;

    case 'plants':
        // RecyclingPlants CRUD
        switch ($method) {
            case 'GET':
                $id = $_GET['id'] ?? null;
                if ($id) {
                    $stmt = $conn->prepare("SELECT * FROM RecyclingPlants WHERE plant_id = ?");
                    $stmt->execute([$id]);
                    sendResponse(true, "Retrieved", $stmt->fetch());
                } else {
                    $stmt = $conn->prepare("SELECT * FROM RecyclingPlants ORDER BY plant_name");
                    $stmt->execute();
                    sendResponse(true, "Retrieved", $stmt->fetchAll());
                }
                break;
            case 'POST':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("INSERT INTO RecyclingPlants (plant_name, location, capacity_tons, waste_types_accepted, contact_person, contact_phone, operational_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if ($stmt->execute([$input['plant_name'], $input['location'], $input['capacity_tons'] ?? 0, $input['waste_types_accepted'] ?? null, $input['contact_person'] ?? null, $input['contact_phone'] ?? null, $input['operational_status'] ?? 'Active'])) {
                    sendResponse(true, "Created", ['plant_id' => $conn->lastInsertId()], 201);
                } else {
                    sendResponse(false, "Failed", null, 500);
                }
                break;
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("UPDATE RecyclingPlants SET plant_name=?, location=?, capacity_tons=?, waste_types_accepted=?, contact_person=?, contact_phone=?, operational_status=? WHERE plant_id=?");
                sendResponse($stmt->execute([$input['plant_name'], $input['location'], $input['capacity_tons'], $input['waste_types_accepted'], $input['contact_person'], $input['contact_phone'], $input['operational_status'], $input['plant_id']]), "Updated", null);
                break;
            case 'DELETE':
                $id = json_decode(file_get_contents('php://input'), true)['id'] ?? $_GET['id'] ?? null;
                $stmt = $conn->prepare("DELETE FROM RecyclingPlants WHERE plant_id = ?");
                sendResponse($stmt->execute([$id]), "Deleted", null);
                break;
        }
        break;

    case 'transportation':
        // Transportation CRUD
        switch ($method) {
            case 'GET':
                $id = $_GET['id'] ?? null;
                if ($id) {
                    $stmt = $conn->prepare("SELECT t.*, c.location as collection_location, p.plant_name FROM Transportation t LEFT JOIN Collection c ON t.collection_id = c.collection_id LEFT JOIN RecyclingPlants p ON t.plant_id = p.plant_id WHERE t.transport_id = ?");
                    $stmt->execute([$id]);
                    sendResponse(true, "Retrieved", $stmt->fetch());
                } else {
                    $stmt = $conn->prepare("SELECT t.*, c.location as collection_location, p.plant_name FROM Transportation t LEFT JOIN Collection c ON t.collection_id = c.collection_id LEFT JOIN RecyclingPlants p ON t.plant_id = p.plant_id ORDER BY t.departure_time DESC");
                    $stmt->execute();
                    sendResponse(true, "Retrieved", $stmt->fetchAll());
                }
                break;
            case 'POST':
                $input = json_decode(file_get_contents('php://input'), true);
                $stmt = $conn->prepare("INSERT INTO Transportation (collection_id, plant_id, vehicle_id, driver_name, route_description, departure_time, distance_km, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                if ($stmt->execute([$input['collection_id'], $input['plant_id'] ?? null, $input['vehicle_id'], $input['driver_name'] ?? null, $input['route_description'] ?? null, $input['departure_time'] ?? null, $input['distance_km'] ?? null, $input['status'] ?? 'Scheduled'])) {
                    sendResponse(true, "Created", ['transport_id' => $conn->lastInsertId()], 201);
                } else {
                    sendResponse(false, "Failed", null, 500);
                }
                break;
            case 'PUT':
                $input = json_decode(file_get_contents('php://input'), true);
                $fields = [];
                $params = [];
                $allowed = ['collection_id', 'plant_id', 'vehicle_id', 'driver_name', 'route_description', 'departure_time', 'arrival_time', 'distance_km', 'fuel_consumption_liters', 'status'];
                foreach ($allowed as $f) {
                    if (isset($input[$f])) {
                        $fields[] = "$f = ?";
                        $params[] = $input[$f];
                    }
                }
                $params[] = $input['transport_id'];
                $stmt = $conn->prepare("UPDATE Transportation SET " . implode(', ', $fields) . " WHERE transport_id = ?");
                sendResponse($stmt->execute($params), "Updated", null);
                break;
            case 'DELETE':
                $id = json_decode(file_get_contents('php://input'), true)['id'] ?? $_GET['id'] ?? null;
                $stmt = $conn->prepare("DELETE FROM Transportation WHERE transport_id = ?");
                sendResponse($stmt->execute([$id]), "Deleted", null);
                break;
        }
        break;
}

?>

