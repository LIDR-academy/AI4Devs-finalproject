"""File upload routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register file upload endpoint."""

	@bp.post("/upload")
	def upload_file():
		return jsonify({"message": "File upload endpoint placeholder"}), 202

