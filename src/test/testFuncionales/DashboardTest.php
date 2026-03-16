<?php
namespace Test\Funcionales;

class DashboardTest {
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

    public function testObtenerDashboard() {
        // Test: GET /api/dashboard
        $ch = curl_init($this->baseUrl . '/dashboard');
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
        
        // Verificar estructura de la respuesta
        assert(isset($result['herramientas']), "La respuesta debe contener la lista de herramientas");
        assert(is_array($result['herramientas']), "herramientas debe ser un array");
        
        // Verificar campos de cada herramienta
        if (!empty($result['herramientas'])) {
            $primeraHerramienta = $result['herramientas'][0];
            assert(isset($primeraHerramienta['nombre']), "Cada herramienta debe tener nombre");
            assert(isset($primeraHerramienta['ubicacion_actual']), "Cada herramienta debe tener ubicación actual");
            assert(isset($primeraHerramienta['estado']), "Cada herramienta debe tener estado");
        }
    }

    public function testDashboardAutorizacion() {
        // Test: Verificar que el dashboard requiere autorización
        $ch = curl_init($this->baseUrl . '/dashboard');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar que sin token devuelve 401
        assert($httpCode === 401, "Sin token debe retornar código 401 Unauthorized");
    }

    public function testDashboardRespuestaFormato() {
        // Test: Verificar formato de respuesta del dashboard
        $ch = curl_init($this->baseUrl . '/dashboard');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        // Verificar campos específicos del dashboard
        foreach ($result['herramientas'] as $herramienta) {
            // Verificar estado (libre/ocupada)
            assert(
                in_array($herramienta['estado'], ['libre', 'ocupada']), 
                "El estado debe ser 'libre' u 'ocupada'"
            );

            // Si está ocupada, verificar información adicional
            if ($herramienta['estado'] === 'ocupada') {
                assert(isset($herramienta['operario']), "Herramienta ocupada debe tener operario");
                assert(isset($herramienta['fecha_inicio']), "Herramienta ocupada debe tener fecha_inicio");
                assert(isset($herramienta['fecha_fin']), "Herramienta ocupada debe tener fecha_fin");
            }
        }
    }
}