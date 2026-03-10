"""File pinning routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register file pinning endpoint."""

	@bp.post("/pinning/<string:cid>")
	def pin_file(cid: str):
		return jsonify({"cid": cid, "message": "Pinning operation placeholder"}), 200

