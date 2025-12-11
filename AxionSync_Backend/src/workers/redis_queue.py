"""
Redis Queue Module for Notification Scheduling

This module provides Redis-based delayed job processing for notifications.
Uses Redis sorted sets for efficient delayed job scheduling.
"""

import redis
import json
import os
import time
from datetime import datetime, timezone
from typing import Any
from dotenv import load_dotenv

load_dotenv()


class RedisQueue:
    """
    Redis-based delayed job queue for notification scheduling.

    Uses Redis sorted sets with score = scheduled timestamp for efficient
    retrieval of jobs that are due.

    Environment Variables:
        REDIS_HOST: Redis server host (default: localhost)
        REDIS_PORT: Redis server port (default: 6379)
        REDIS_PASSWORD: Redis password (default: None)
        REDIS_DB: Redis database number (default: 0)
    """

    # Queue names
    NOTIFICATION_QUEUE = "axionsync:notifications:scheduled"
    NOTIFICATION_PROCESSING = "axionsync:notifications:processing"
    NOTIFICATION_DEAD_LETTER = "axionsync:notifications:dead_letter"

    def __init__(self):
        """Initialize Redis connection"""
        self.redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            password=os.getenv("REDIS_PASSWORD", None),
            db=int(os.getenv("REDIS_DB", 0)),
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
        )

    def _get_job_key(self, notification_id: int) -> str:
        """Generate unique job key for a notification"""
        return f"notification:{notification_id}"

    def schedule_notification(self, payload: Any, delay_seconds: int) -> bool:
        """
        Schedule a notification job with delay.

        Args:
            payload: NotificationJobPayload object
            delay_seconds: Seconds from now to execute the job

        Returns:
            True if successfully scheduled, False otherwise
        """
        try:
            # Calculate execution time (Unix timestamp)
            execute_at = time.time() + delay_seconds

            # Serialize payload
            job_data = {
                "notification_id": payload.notification_id,
                "todo_id": payload.todo_id,
                "user_id": payload.user_id,
                "channel": payload.channel,
                "message": payload.message,
                "scheduled_at": (
                    payload.scheduled_at.isoformat() if payload.scheduled_at else None
                ),
                "retry_count": payload.retry_count,
                "max_retries": payload.max_retries,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            job_key = self._get_job_key(payload.notification_id)
            job_json = json.dumps(job_data)

            # Use pipeline for atomic operation
            pipe = self.redis_client.pipeline()

            # Store job data
            pipe.set(f"job:{job_key}", job_json)

            # Add to scheduled queue with score = execute_at
            pipe.zadd(self.NOTIFICATION_QUEUE, {job_key: execute_at})

            pipe.execute()

            return True
        except redis.RedisError as e:
            print(f"Redis error scheduling notification: {e}")
            return False

    def cancel_notification(self, notification_id: int) -> bool:
        """
        Cancel a scheduled notification.

        Args:
            notification_id: ID of the notification to cancel

        Returns:
            True if cancelled, False if not found or error
        """
        try:
            job_key = self._get_job_key(notification_id)

            pipe = self.redis_client.pipeline()
            pipe.zrem(self.NOTIFICATION_QUEUE, job_key)
            pipe.zrem(self.NOTIFICATION_PROCESSING, job_key)
            pipe.delete(f"job:{job_key}")
            results = pipe.execute()

            return any(results)
        except redis.RedisError as e:
            print(f"Redis error cancelling notification: {e}")
            return False

    def get_due_jobs(self, limit: int = 100) -> list[dict]:
        """
        Get jobs that are due for execution.

        Args:
            limit: Maximum number of jobs to retrieve

        Returns:
            List of job payloads ready for processing
        """
        try:
            current_time = time.time()

            # Get jobs with score <= current time
            job_keys = self.redis_client.zrangebyscore(
                self.NOTIFICATION_QUEUE,
                min=0,
                max=current_time,
                start=0,
                num=limit,
            )

            if not job_keys:
                return []

            jobs = []
            for job_key in job_keys:
                job_data = self.redis_client.get(f"job:{job_key}")
                if job_data:
                    jobs.append(json.loads(job_data))

            return jobs
        except redis.RedisError as e:
            print(f"Redis error getting due jobs: {e}")
            return []

    def move_to_processing(self, notification_id: int) -> bool:
        """
        Move a job from scheduled to processing queue.

        Args:
            notification_id: ID of the notification

        Returns:
            True if moved successfully
        """
        try:
            job_key = self._get_job_key(notification_id)
            current_time = time.time()

            pipe = self.redis_client.pipeline()
            pipe.zrem(self.NOTIFICATION_QUEUE, job_key)
            pipe.zadd(self.NOTIFICATION_PROCESSING, {job_key: current_time})
            pipe.execute()

            return True
        except redis.RedisError as e:
            print(f"Redis error moving to processing: {e}")
            return False

    def complete_job(self, notification_id: int) -> bool:
        """
        Mark a job as completed and remove from queues.

        Args:
            notification_id: ID of the notification

        Returns:
            True if completed successfully
        """
        try:
            job_key = self._get_job_key(notification_id)

            pipe = self.redis_client.pipeline()
            pipe.zrem(self.NOTIFICATION_PROCESSING, job_key)
            pipe.delete(f"job:{job_key}")
            pipe.execute()

            return True
        except redis.RedisError as e:
            print(f"Redis error completing job: {e}")
            return False

    def retry_job(self, notification_id: int, delay_seconds: int = 60) -> bool:
        """
        Reschedule a failed job for retry.

        Args:
            notification_id: ID of the notification
            delay_seconds: Delay before retry

        Returns:
            True if rescheduled successfully
        """
        try:
            job_key = self._get_job_key(notification_id)

            # Get current job data
            job_data = self.redis_client.get(f"job:{job_key}")
            if not job_data:
                return False

            job = json.loads(job_data)
            job["retry_count"] = job.get("retry_count", 0) + 1

            # Check max retries
            if job["retry_count"] >= job.get("max_retries", 3):
                return self.move_to_dead_letter(notification_id)

            # Reschedule
            execute_at = time.time() + delay_seconds

            pipe = self.redis_client.pipeline()
            pipe.set(f"job:{job_key}", json.dumps(job))
            pipe.zrem(self.NOTIFICATION_PROCESSING, job_key)
            pipe.zadd(self.NOTIFICATION_QUEUE, {job_key: execute_at})
            pipe.execute()

            return True
        except redis.RedisError as e:
            print(f"Redis error retrying job: {e}")
            return False

    def move_to_dead_letter(self, notification_id: int) -> bool:
        """
        Move a failed job to dead letter queue after max retries.

        Args:
            notification_id: ID of the notification

        Returns:
            True if moved successfully
        """
        try:
            job_key = self._get_job_key(notification_id)
            current_time = time.time()

            pipe = self.redis_client.pipeline()
            pipe.zrem(self.NOTIFICATION_QUEUE, job_key)
            pipe.zrem(self.NOTIFICATION_PROCESSING, job_key)
            pipe.zadd(self.NOTIFICATION_DEAD_LETTER, {job_key: current_time})
            pipe.execute()

            return True
        except redis.RedisError as e:
            print(f"Redis error moving to dead letter: {e}")
            return False

    def get_queue_stats(self) -> dict:
        """
        Get statistics about the notification queues.

        Returns:
            Dictionary with queue counts
        """
        try:
            return {
                "scheduled": self.redis_client.zcard(self.NOTIFICATION_QUEUE),
                "processing": self.redis_client.zcard(self.NOTIFICATION_PROCESSING),
                "dead_letter": self.redis_client.zcard(self.NOTIFICATION_DEAD_LETTER),
            }
        except redis.RedisError as e:
            print(f"Redis error getting stats: {e}")
            return {"scheduled": 0, "processing": 0, "dead_letter": 0}

    def health_check(self) -> bool:
        """
        Check Redis connection health.

        Returns:
            True if connected, False otherwise
        """
        try:
            self.redis_client.ping()
            return True
        except redis.RedisError:
            return False

    def close(self):
        """Close Redis connection"""
        try:
            self.redis_client.close()
        except Exception:
            pass
