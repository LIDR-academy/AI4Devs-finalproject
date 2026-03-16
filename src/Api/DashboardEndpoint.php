<?php
namespace App\Api;

use App\Controllers\DashboardController;
use App\DTO\ResponseDTO;

class DashboardEndpoint {
    private DashboardController $controller;

    public function __construct() {
        $this->controller = new DashboardController();
    }

    public function index(): ResponseDTO {
        return $this->controller->index();
    }
}