"""HTTP caching utilities for file retrieval."""

import hashlib
import logging
from datetime import datetime
from typing import Optional

from flask import Response, request

logger = logging.getLogger(__name__)


def generate_etag(cid: str) -> str:
	"""Generate ETag for a file based on its CID.
	
	Since CIDs are content-addressed and immutable, the CID itself
	serves as a perfect ETag.
	
	Args:
		cid: Content Identifier
		
	Returns:
		ETag string (quoted)
		
	Example:
		>>> etag = generate_etag("QmXyZ123...")
		>>> # Returns: '"QmXyZ123..."'
	"""
	return f'"{cid}"'


def should_return_304(
	etag: str,
	last_modified: Optional[datetime] = None,
) -> bool:
	"""Check if client's cache is still valid (return 304 Not Modified).
	
	Checks If-None-Match and If-Modified-Since headers against current
	resource state.
	
	Args:
		etag: Current ETag of the resource
		last_modified: Optional last modified timestamp
		
	Returns:
		True if 304 should be returned, False otherwise
		
	Example:
		>>> if should_return_304(etag, file.created_at):
		>>>     return Response(status=304)
	"""
	# Check If-None-Match header (ETag comparison)
	if_none_match = request.headers.get("If-None-Match")
	if if_none_match:
		# Handle multiple ETags (comma-separated)
		client_etags = [tag.strip() for tag in if_none_match.split(",")]
		if etag in client_etags or "*" in client_etags:
			logger.debug(f"ETag match: {etag} in {if_none_match}")
			return True
	
	# Check If-Modified-Since header (timestamp comparison)
	if last_modified:
		if_modified_since = request.headers.get("If-Modified-Since")
		if if_modified_since:
			try:
				# Parse HTTP date format
				client_date = datetime.strptime(
					if_modified_since,
					"%a, %d %b %Y %H:%M:%S GMT"
				)
				# Compare timestamps (truncate to seconds)
				if last_modified.replace(microsecond=0) <= client_date:
					logger.debug(
						f"Not modified since {if_modified_since}: "
						f"resource modified at {last_modified}"
					)
					return True
			except ValueError:
				logger.warning(f"Invalid If-Modified-Since header: {if_modified_since}")
	
	return False


def add_cache_headers(
	response: Response,
	cid: str,
	file_id: int,
	created_at: datetime,
	max_age: int = 31536000,  # 1 year
) -> Response:
	"""Add caching headers to response.
	
	Leverages CID immutability for aggressive caching:
	- ETag: Content identifier (for validation)
	- Cache-Control: Public, immutable, long max-age
	- Last-Modified: File creation timestamp
	
	Args:
		response: Flask Response object
		cid: Content Identifier
		file_id: File database ID
		created_at: File creation timestamp
		max_age: Cache max-age in seconds (default: 1 year)
		
	Returns:
		Response with cache headers added
		
	Example:
		>>> response = Response(file_data, mimetype=mime_type)
		>>> response = add_cache_headers(response, cid, file_id, created_at)
	"""
	# Set ETag (CID is perfect content identifier)
	response.headers["ETag"] = generate_etag(cid)
	
	# Set Cache-Control for aggressive caching
	# immutable directive tells browser content will never change
	response.headers["Cache-Control"] = f"public, max-age={max_age}, immutable"
	
	# Set Last-Modified header
	last_modified_str = created_at.strftime("%a, %d %b %Y %H:%M:%S GMT")
	response.headers["Last-Modified"] = last_modified_str
	
	# Add custom header for debugging
	response.headers["X-File-ID"] = str(file_id)
	response.headers["X-Content-CID"] = cid
	
	logger.debug(
		f"Cache headers added: ETag={cid}, "
		f"Last-Modified={last_modified_str}, "
		f"max-age={max_age}"
	)
	
	return response


def create_304_response(etag: str, last_modified: datetime) -> Response:
	"""Create a 304 Not Modified response with appropriate headers.
	
	Args:
		etag: ETag to include in response
		last_modified: Last modified timestamp
		
	Returns:
		Response with 304 status and caching headers
		
	Example:
		>>> if should_return_304(etag, file.created_at):
		>>>     return create_304_response(etag, file.created_at)
	"""
	response = Response(status=304)
	response.headers["ETag"] = etag
	response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
	last_modified_str = last_modified.strftime("%a, %d %b %Y %H:%M:%S GMT")
	response.headers["Last-Modified"] = last_modified_str
	
	logger.debug(f"Returning 304 Not Modified: ETag={etag}")
	
	return response
