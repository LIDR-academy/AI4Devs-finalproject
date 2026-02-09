"""
Supabase client configuration and utilities.

This module provides a singleton Supabase client instance
and utility functions for interacting with Supabase services.
"""
import os
from supabase import create_client, Client
from typing import Optional


_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create a Supabase client instance.
    
    This function implements a singleton pattern to reuse
    the same client instance across the application.
    
    Returns:
        Client: Configured Supabase client
        
    Raises:
        ValueError: If SUPABASE_URL or SUPABASE_KEY are not set
    """
    global _supabase_client
    
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in environment variables"
            )
        
        _supabase_client = create_client(url, key)
    
    return _supabase_client
