"""Swagger/Flasgger configuration for API documentation."""

SWAGGER_CONFIG = {
	"headers": [],
	"specs": [
		{
			"endpoint": "swagger",
			"route": "/swagger.json",
			"rule_filter": lambda rule: rule.rule.startswith("/api/v1"),
			"model_filter": lambda _tag: True,
		}
	],
	"specs_route": "/swagger",
	"swagger_ui": True,
	"uiversion": 3,
}


SWAGGER_TEMPLATE = {
	"openapi": "3.0.3",
	"info": {
		"title": "IPFS Gateway API",
		"description": "API for decentralized file storage and retrieval with IPFS.",
		"version": "v1",
	},
	"basePath": "/api/v1",
	"schemes": ["http", "https"],
	"securityDefinitions": {
		"ApiKeyAuth": {
			"type": "apiKey",
			"name": "X-API-Key",
			"in": "header",
			"description": "Provide your API key in the X-API-Key request header.",
		}
	},
	"definitions": {
		"ErrorEnvelope": {
			"type": "object",
			"properties": {
				"status": {"type": "integer", "example": 400},
				"message": {"type": "string", "example": "Validation error"},
				"code": {"type": "string", "example": "VALIDATION_ERROR"},
				"details": {"type": "object", "nullable": True},
				"request_id": {"type": "string", "example": "4d5f1f23cc924c08af4fcb34111f7d0f"},
			},
			"required": ["status", "message"],
		},
		"SuccessEnvelope": {
			"type": "object",
			"properties": {
				"status": {"type": "integer", "example": 200},
				"message": {"type": "string", "example": "Operation successful"},
				"data": {"type": "object"},
				"meta": {"type": "object", "nullable": True},
				"request_id": {"type": "string", "example": "4d5f1f23cc924c08af4fcb34111f7d0f"},
			},
			"required": ["status"],
		},
		"RegisterRequest": {
			"type": "object",
			"required": ["email", "password"],
			"properties": {
				"email": {"type": "string", "format": "email", "example": "user@example.com"},
				"password": {"type": "string", "minLength": 8, "example": "StrongPass123!"},
			},
		},
		"VerificationRequest": {
			"type": "object",
			"required": ["verification_code"],
			"properties": {
				"verification_code": {"type": "string", "example": "123456"},
			},
		},
		"AdminEmailRequest": {
			"type": "object",
			"required": ["user_email"],
			"properties": {
				"user_email": {"type": "string", "format": "email", "example": "user@example.com"},
			},
		},
	},
	"tags": [
		{"name": "Health", "description": "Health and service check endpoints."},
		{"name": "Users", "description": "Registration and API key lifecycle endpoints."},
		{"name": "Files", "description": "Upload, retrieval, and pinning endpoints."},
		{"name": "Tasks", "description": "Asynchronous task monitoring endpoints."},
		{"name": "Admin", "description": "Administrator-only endpoints."},
	],
}