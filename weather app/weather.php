<?php
$servername = "mi-linux.wlv.ac.uk"; 
$username = "2409166"; 
$password = "D12345ILSHAN@#"; 
$dbname = "db2409166";


$conn = new mysqli($servername, $username, $password, $dbname);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


function fetchWeatherFromAPI($city) {
    $apiKey = "787f001d355f88d21711a56f32efcd60"; 
    $url = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&units=metric";

    $response = file_get_contents($url);
    return json_decode($response, true);
}


function getWeatherFromDatabase($city) {
    global $conn;
    $stmt = $conn->prepare("SELECT * FROM weather_data WHERE city_name = ? ORDER BY timestamp DESC LIMIT 1");
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}


function insertWeatherIntoDatabase($data) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO weather_data (city_name, country_code, temperature, humidity, wind_speed, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdiis", $data['city_name'], $data['country_code'], $data['temperature'], $data['humidity'], $data['wind_speed'], $data['description']);
    $stmt->execute();
}

if (isset($_GET['city'])) {
    $city = $_GET['city'];

    
    $weatherData = getWeatherFromDatabase($city);

    if ($weatherData) {
        
        echo json_encode($weatherData);
    } else {
        
        $weatherAPIData = fetchWeatherFromAPI($city);
        
        if ($weatherAPIData && $weatherAPIData['cod'] == 200) {
            $weatherDataToStore = [
                'city_name' => $weatherAPIData['name'],
                'country_code' => $weatherAPIData['sys']['country'],
                'temperature' => $weatherAPIData['main']['temp'],
                'humidity' => $weatherAPIData['main']['humidity'],
                'wind_speed' => $weatherAPIData['wind']['speed'],
                'description' => $weatherAPIData['weather'][0]['description']
            ];
            
            
            insertWeatherIntoDatabase($weatherDataToStore);

            
            echo json_encode($weatherDataToStore);
        } else {
            echo json_encode(['error' => 'City not found or API error']);
        }
    }
}

$conn->close();
?>
