"""File retrieval routes."""

from flask import Blueprint, jsonify


def register_routes(bp: Blueprint) -> None:
	"""Register file retrieval endpoint."""

	@bp.get("/retrieve/<string:cid>")
	def retrieve_file(cid: str):
		return jsonify({"cid": cid, "message": "File retrieval placeholder"}), 200

