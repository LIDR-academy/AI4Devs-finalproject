<?php
namespace App\DTO;

class ResponseDTO {
    public bool $success;
    public string $message;
    public mixed $data;
    public int $statusCode;

    public function __construct(
        bool $success = true,
        string $message = '',
        mixed $data = null,
        int $statusCode = 200
    ) {
        $this->success = $success;
        $this->message = $message;
        $this->data = $data;
        $this->statusCode = $statusCode;
    }

    public function toArray(): array {
        return [
            'success' => $this->success,
            'message' => $this->message,
            'data' => $this->data,
            'statusCode' => $this->statusCode
        ];
    }
}