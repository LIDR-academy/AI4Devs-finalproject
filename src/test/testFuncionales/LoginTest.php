<?php
namespace Test\Funcionales;

class LoginTest {
    private $baseUrl;

    public function __construct() {
        // Lee la URL base desde variables de entorno o usa una por defecto
        $this->baseUrl = getenv('API_BASE_URL') ?: "http://localhost/AI4Devs-finalproject/api";
    }

    public function testEnviarCodigoLogin() {
        // Test: POST /api/login/send-code
        $data = [
            'email' => 'operario@astillero.com'
        ];
        
        $ch = curl_init($this->baseUrl . '/login/send-code');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(isset($result['success']), "La respuesta debe contener el campo 'success'");
    }

    public function testValidarCodigoLogin() {
        // Test: POST /api/login/validate-code
        $data = [
            'email' => 'operario@astillero.com',
            'codigo' => 'ABC12345'
        ];
        
        $ch = curl_init($this->baseUrl . '/login/validate-code');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Verificar respuesta
        assert($httpCode === 200, "El endpoint debe retornar código 200");
        $result = json_decode($response, true);
        assert(isset($result['token']), "La respuesta debe contener el token de sesión");
    }
}