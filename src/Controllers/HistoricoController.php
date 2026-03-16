<?php
namespace App\Controllers;

use App\Services\HistoricoService;
use App\DTO\ResponseDTO;

class HistoricoController {
    private HistoricoService $historicoService;

    public function __construct() {
        $this->historicoService = new HistoricoService();
    }

    public function index(): ResponseDTO {
        return $this->historicoService->getHistorico();
    }
}
