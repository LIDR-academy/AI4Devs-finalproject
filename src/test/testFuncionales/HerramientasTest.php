<?php
namespace Test\Funcionales;

class HerramientasTest {
    private $baseUrl = "http://localhost/AI4Devs-finalproject/api";
    private $token = ''; // Token de sesión válido para las pruebas

    public function __construct() {
        // Obtener un token válido para las pruebas
        $this->obtenerToken();
    }

    private function obtenerToken() {
        // Implementar lógica para obtener un token válido
        // Este método debería hacer login y obtener un token para las pruebas
    }

    public function testObtenerHerramientas() {
        // Test: GET /api/herramientas
        $ch = curl_init($this->baseUrl . '/herramientas');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(is_array($result), "La respuesta debe ser un array de herramientas");
    }

    public function testObtenerEstadoHerramienta() {
        // Test: GET /api/herramientas/{id}/estado
        $herramientaId = 1; // ID de ejemplo
        
        $ch = curl_init($this->baseUrl . '/herramientas/' . $herramientaId . '/estado');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(isset($result['estado']), "La respuesta debe contener el estado de la herramienta");
    }

    public function testUsarHerramienta() {
        // Test: POST /api/herramientas/{id}/usar
        $herramientaId = 1; // ID de ejemplo
        $data = [
            'ubicacion_id' => 1,
            'fecha_inicio' => '2025-10-18 10:00:00',
            'fecha_fin' => '2025-10-18 18:00:00'
        ];
        
        $ch = curl_init($this->baseUrl . '/herramientas/' . $herramientaId . '/usar');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(isset($result['success']), "La respuesta debe indicar si la operación fue exitosa");
    }

    public function testDejarHerramienta() {
        // Test: POST /api/herramientas/{id}/dejar
        $herramientaId = 1; // ID de ejemplo
        $data = [
            'ubicacion_id' => 2
        ];
        
        $ch = curl_init($this->baseUrl . '/herramientas/' . $herramientaId . '/dejar');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(isset($result['success']), "La respuesta debe indicar si la operación fue exitosa");
    }

    public function testObtenerHistorialHerramienta() {
        // Test: GET /api/herramientas/{id}/historial
        $herramientaId = 1; // ID de ejemplo
        
        $ch = curl_init($this->baseUrl . '/herramientas/' . $herramientaId . '/historial');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(is_array($result), "La respuesta debe ser un array con el historial");
    }
}