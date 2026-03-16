<?php
namespace App\Controllers;

use App\Services\HerramientaService;
use App\DTO\ResponseDTO;

class DashboardController {
    private HerramientaService $herramientaService;

    public function __construct() {
        $this->herramientaService = new HerramientaService();
    }

    public function index(): ResponseDTO {
        return $this->herramientaService->getHerramientas();
    }
}