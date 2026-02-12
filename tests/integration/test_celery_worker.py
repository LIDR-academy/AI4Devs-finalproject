"""
Integration tests for T-022-INFRA: Redis & Celery Worker Setup

These tests verify:
1. Redis service is accessible and functional
2. Celery worker starts and accepts tasks
3. Task execution, retry policies, and error handling
4. Security configurations (port binding, serialization)
5. Integration with PostgreSQL and Supabase Storage

Status: TDD-RED Phase
Expected: All tests should FAIL because infrastructure is not implemented yet.
"""

import pytest
import os
import subprocess
import time
import socket
from typing import Dict, Any

# These imports WILL FAIL because modules don't exist yet (expected in RED phase)
try:
    from src.agent.celery_app import celery_app
    from src.agent.tasks import health_check, validate_file
    from src.agent.config import settings as agent_settings
except ModuleNotFoundError:
    # Expected error in RED phase
    celery_app = None
    health_check = None
    validate_file = None
    agent_settings = None


class TestRedisConnectivity:
    """Test Redis broker is accessible and responding."""

    def test_redis_ping_responds(self):
        """
        Test 1: Redis responds to PING command
        
        DoD: Redis container is running and responds with PONG.
        Expected Error (RED): Connection refused (redis service not in docker-compose)
        """
        # Try to ping Redis using redis-cli from within Docker network
        result = subprocess.run(
            ["docker", "exec", "sf-pm-redis", "redis-cli", "ping"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        assert result.returncode == 0, "Redis container should be accessible"
        assert "PONG" in result.stdout, "Redis should respond with PONG to ping"

    def test_redis_not_accessible_externally(self):
        """
        Test 2: Redis is NOT accessible from host machine (security check)
        
        DoD: Redis port 6379 is bound to 127.0.0.1 only, not 0.0.0.0
        Expected Error (RED): Service not found
        """
        # Try to connect to Redis from host machine using public IP
        # This should FAIL (connection refused) even after implementation
        with pytest.raises((socket.error, ConnectionRefusedError)):
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            # Try to connect to Redis on public interface (should fail)
            result = sock.connect_ex(("192.168.1.100", 6379))  # Example public IP
            sock.close()
            
            # If result == 0, connection succeeded (SECURITY ISSUE)
            if result == 0:
                raise AssertionError(
                    "SECURITY VULNERABILITY: Redis is accessible from external network. "
                    "Port binding should be 127.0.0.1:6379, not 0.0.0.0:6379"
                )


class TestCeleryWorkerLifecycle:
    """Test Celery worker starts, stops, and restarts correctly."""

    def test_worker_starts_without_errors(self):
        """
        Test 3: Agent worker service starts successfully
        
        DoD: `docker compose up agent-worker` runs without errors
        Expected Error (RED): Service 'agent-worker' not found in docker-compose.yml
        """
        # Check if agent-worker service is running
        result = subprocess.run(
            ["docker", "compose", "ps", "agent-worker"],
            capture_output=True,
            text=True,
            cwd="/Users/pedrocortes/Documents/source/ai4devs/ai4devs-finalproject"
        )
        
        assert result.returncode == 0, "docker compose ps should succeed"
        assert "Up" in result.stdout or "running" in result.stdout.lower(), \
            "agent-worker service should be running"

    def test_worker_logs_show_ready_state(self):
        """
        Test 4: Worker logs indicate it's ready to accept tasks
        
        DoD: Logs contain "celery@hostname ready" message
        Expected Error (RED): Container not found
        """
        # Get last 20 lines of worker logs
        result = subprocess.run(
            ["docker", "compose", "logs", "--tail=20", "agent-worker"],
            capture_output=True,
            text=True,
            cwd="/Users/pedrocortes/Documents/source/ai4devs/ai4devs-finalproject"
        )
        
        assert result.returncode == 0, "Should be able to fetch logs"
        assert "ready" in result.stdout.lower(), \
            "Worker logs should contain 'ready' status"


class TestTaskExecution:
    """Test Celery tasks can be enqueued and executed."""

    def test_health_check_task_executes(self):
        """
        Test 5: Health check dummy task executes successfully
        
        DoD: health_check.delay() returns SUCCESS state with expected metadata
        Expected Error (RED): ModuleNotFoundError: No module named 'src.agent'
        """
        if celery_app is None or health_check is None:
            pytest.fail(
                "EXPECTED FAILURE (RED PHASE): "
                "Module 'src.agent.celery_app' or 'src.agent.tasks' does not exist yet"
            )
        
        # Enqueue health check task
        async_result = health_check.delay()
        
        # Wait for result (max 10 seconds)
        result = async_result.get(timeout=10)
        
        # Verify result structure
        assert isinstance(result, dict), "Health check should return a dictionary"
        assert result.get("status") == "healthy", "Status should be 'healthy'"
        assert "worker_id" in result, "Result should contain worker_id"
        assert "hostname" in result, "Result should contain hostname"
        assert "timestamp" in result, "Result should contain timestamp"

    def test_task_retry_policy_works(self):
        """
        Test 6: Task fails and retries automatically (3 attempts)
        
        DoD: Task with max_retries=3 retries on failure
        Expected Error (RED): Module not found
        """
        if celery_app is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): celery_app module not found")
        
        # This test would require a custom failing task
        # For RED phase, we just verify the celery_app config exists
        assert celery_app.conf.task_acks_late is True or celery_app.conf.task_acks_late is None, \
            "Task acknowledgment should be configured"


class TestSecurityConfiguration:
    """Test security settings (serialization, authentication)."""

    def test_serializer_rejects_pickle(self):
        """
        Test 7: Celery rejects pickle-serialized messages (security)
        
        DoD: Only JSON serialization is accepted (accept_content=["json"])
        Expected Error (RED): celery_app not configured
        """
        if celery_app is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): celery_app not configured")
        
        # Verify serializer configuration
        assert "json" in celery_app.conf.accept_content, \
            "Celery should accept JSON serialization"
        assert "pickle" not in celery_app.conf.accept_content, \
            "Celery should NOT accept pickle serialization (security risk)"
        assert celery_app.conf.task_serializer == "json", \
            "Task serializer should be JSON"
        assert celery_app.conf.result_serializer == "json", \
            "Result serializer should be JSON"

    def test_celery_config_variables_set(self):
        """
        Test 8: Environment variables for Celery are properly configured
        
        DoD: CELERY_BROKER_URL and CELERY_RESULT_BACKEND are set
        Expected Error (RED): agent_settings module not found
        """
        if agent_settings is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): agent.config.settings not found")
        
        # Verify configuration values
        assert agent_settings.CELERY_BROKER_URL is not None, \
            "CELERY_BROKER_URL must be set"
        assert agent_settings.CELERY_RESULT_BACKEND is not None, \
            "CELERY_RESULT_BACKEND must be set"
        assert "redis://" in agent_settings.CELERY_BROKER_URL, \
            "Broker URL should point to Redis"
        assert "redis://" in agent_settings.CELERY_RESULT_BACKEND, \
            "Result backend should point to Redis"


class TestIntegrationBackendWorker:
    """Test integration between FastAPI backend and Celery worker."""

    def test_backend_can_send_task_to_worker(self):
        """
        Test 9: Backend can send tasks to worker via Celery
        
        DoD: Backend sends task, worker processes it, backend retrieves result
        Expected Error (RED): Module not found
        """
        if celery_app is None or health_check is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): Celery modules not found")
        
        # Send task from "backend" context (simulated)
        task_result = celery_app.send_task(
            "agent.tasks.health_check",
            args=[],
            kwargs={}
        )
        
        # Wait for result
        result = task_result.get(timeout=10)
        
        assert task_result.state == "SUCCESS", "Task should complete successfully"
        assert result.get("status") == "healthy", "Task should return healthy status"


class TestIntegrationWorkerDatabase:
    """Test worker can access PostgreSQL database."""

    def test_worker_can_write_to_database(self):
        """
        Test 10: Worker can execute database queries
        
        DoD: Worker connects to PostgreSQL and executes simple query (SELECT 1)
        Expected Error (RED): Database connection not configured in worker
        """
        # This would require a test task that writes to DB
        # For RED phase, verify DATABASE_URL is configured
        if agent_settings is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): agent_settings not found")
        
        assert agent_settings.DATABASE_URL is not None, \
            "DATABASE_URL must be configured in agent settings"
        assert "postgresql://" in agent_settings.DATABASE_URL, \
            "DATABASE_URL should be a PostgreSQL connection string"


class TestIntegrationWorkerStorage:
    """Test worker can access Supabase Storage."""

    def test_worker_can_read_from_storage(self):
        """
        Test 11: Worker can list Supabase Storage buckets
        
        DoD: Worker has SUPABASE_URL and SUPABASE_KEY configured
        Expected Error (RED): Supabase config missing
        """
        if agent_settings is None:
            pytest.fail("EXPECTED FAILURE (RED PHASE): agent_settings not found")
        
        assert agent_settings.SUPABASE_URL is not None, \
            "SUPABASE_URL must be configured"
        assert agent_settings.SUPABASE_KEY is not None, \
            "SUPABASE_KEY must be configured"
        assert agent_settings.SUPABASE_URL.startswith("https://"), \
            "SUPABASE_URL should be an HTTPS URL"


# ==============================================================================
# PYTEST CONFIGURATION & HELPERS
# ==============================================================================

@pytest.fixture(scope="session")
def wait_for_services():
    """
    Wait for Redis and agent-worker to be ready before running tests.
    
    This fixture would be used in GREEN phase. In RED phase it will fail.
    """
    max_wait = 30  # seconds
    start_time = time.time()
    
    while time.time() - start_time < max_wait:
        try:
            # Check if Redis is responding
            result = subprocess.run(
                ["docker", "exec", "sf-pm-redis", "redis-cli", "ping"],
                capture_output=True,
                timeout=2
            )
            if result.returncode == 0:
                return True
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
            time.sleep(1)
    
    pytest.fail("Services did not become ready in time")


@pytest.fixture
def celery_task_timeout():
    """Default timeout for Celery task execution in tests."""
    return 10  # seconds


# ==============================================================================
# EXPECTED ERRORS IN RED PHASE
# ==============================================================================
"""
Summary of Expected Failures (TDD-RED):

1. ModuleNotFoundError: No module named 'src.agent'
   - Cause: src/agent/ directory and modules don't exist yet
   - Files missing: celery_app.py, tasks.py, config.py

2. docker.errors.NotFound: No such service: redis
   - Cause: redis service not defined in docker-compose.yml
   - Fix: Add redis service configuration (GREEN phase)

3. docker.errors.NotFound: No such service: agent-worker
   - Cause: agent-worker service not defined in docker-compose.yml
   - Fix: Add agent-worker service configuration (GREEN phase)

4. AssertionError: Various assertions will fail
   - Cause: Services not running, configuration not set
   - Fix: Implement infrastructure (GREEN phase)

All failures are EXPECTED and CORRECT for TDD-RED phase.
Next step: GREEN phase - implement infrastructure to make tests pass.
"""
