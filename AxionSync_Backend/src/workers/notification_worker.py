"""
Notification Worker Module

This module processes scheduled notification jobs from Redis queue.
Supports multiple notification channels: in_app, email, push.

Usage:
    python -m src.workers.notification_worker

    Or with custom settings:
    WORKER_POLL_INTERVAL=5 WORKER_BATCH_SIZE=50 python -m src.workers.notification_worker
"""

import time
import signal
import sys
import os
from datetime import datetime, timezone
from typing import Callable
from dotenv import load_dotenv

load_dotenv()

from src.workers.redis_queue import RedisQueue
from src.services.sv_notification import NotificationService
from src.sql_query.sql_notification import SQLNotification


class NotificationWorker:
    """
    Worker process that polls Redis queue and processes notification jobs.

    Features:
    - Graceful shutdown on SIGINT/SIGTERM
    - Automatic retry with exponential backoff
    - Dead letter queue for failed jobs
    - Support for multiple notification channels
    - Health monitoring

    Environment Variables:
        WORKER_POLL_INTERVAL: Seconds between queue polls (default: 10)
        WORKER_BATCH_SIZE: Max jobs to process per poll (default: 100)
        WORKER_RETRY_DELAY: Base delay for retries in seconds (default: 60)
    """

    def __init__(self):
        """Initialize worker components"""
        self.redis_queue = RedisQueue()
        self.sv_notification = NotificationService()
        self.sql_notification = SQLNotification()

        self.poll_interval = int(os.getenv("WORKER_POLL_INTERVAL", 10))
        self.batch_size = int(os.getenv("WORKER_BATCH_SIZE", 100))
        self.retry_delay = int(os.getenv("WORKER_RETRY_DELAY", 60))

        self.running = False
        self._setup_signal_handlers()

        # Channel handlers
        self.channel_handlers: dict[str, Callable] = {
            "in_app": self._send_in_app_notification,
            "email": self._send_email_notification,
            "push": self._send_push_notification,
        }

    def _setup_signal_handlers(self):
        """Setup graceful shutdown handlers"""
        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

    def _handle_shutdown(self, signum, frame):
        """Handle shutdown signal"""
        print(f"\n[Worker] Received shutdown signal ({signum}). Gracefully stopping...")
        self.running = False

    def start(self):
        """Start the worker loop"""
        print(f"[Worker] Starting notification worker...")
        print(f"[Worker] Poll interval: {self.poll_interval}s")
        print(f"[Worker] Batch size: {self.batch_size}")

        # Check Redis connection
        if not self.redis_queue.health_check():
            print("[Worker] ERROR: Cannot connect to Redis. Exiting.")
            sys.exit(1)

        print("[Worker] Connected to Redis. Starting job processing...")
        self.running = True

        while self.running:
            try:
                self._process_batch()
            except Exception as e:
                print(f"[Worker] Error in processing loop: {e}")

            if self.running:
                time.sleep(self.poll_interval)

        print("[Worker] Worker stopped.")
        self.redis_queue.close()

    def _process_batch(self):
        """Process a batch of due jobs"""
        jobs = self.redis_queue.get_due_jobs(limit=self.batch_size)

        if not jobs:
            return

        print(f"[Worker] Processing {len(jobs)} jobs...")

        for job in jobs:
            if not self.running:
                break
            self._process_job(job)

    def _process_job(self, job: dict):
        """Process a single notification job"""
        notification_id = job.get("notification_id")

        if not notification_id:
            print(f"[Worker] Invalid job - missing notification_id: {job}")
            return

        try:
            # Move to processing queue
            self.redis_queue.move_to_processing(notification_id)

            # Get notification from database
            notification = self.sv_notification.get_notification_by_id(notification_id)
            if not notification:
                print(
                    f"[Worker] Notification {notification_id} not found in database. Removing job."
                )
                self.redis_queue.complete_job(notification_id)
                return

            # Skip if already sent
            if notification.is_sent:
                print(
                    f"[Worker] Notification {notification_id} already sent. Removing job."
                )
                self.redis_queue.complete_job(notification_id)
                return

            # Send notification via appropriate channel
            channel = job.get("channel", "in_app")
            handler = self.channel_handlers.get(channel, self._send_in_app_notification)

            success = handler(notification, job)

            if success:
                # Mark as sent in database
                self.sql_notification.mark_notification_sent(notification_id)
                self.redis_queue.complete_job(notification_id)
                print(
                    f"[Worker] Notification {notification_id} sent successfully via {channel}"
                )
            else:
                # Retry with exponential backoff
                retry_count = job.get("retry_count", 0)
                delay = self.retry_delay * (2**retry_count)  # Exponential backoff

                if self.redis_queue.retry_job(notification_id, delay):
                    print(
                        f"[Worker] Notification {notification_id} scheduled for retry in {delay}s"
                    )
                else:
                    print(
                        f"[Worker] Notification {notification_id} moved to dead letter queue"
                    )

        except Exception as e:
            print(f"[Worker] Error processing notification {notification_id}: {e}")
            # Attempt retry
            self.redis_queue.retry_job(notification_id, self.retry_delay)

    def _send_in_app_notification(self, notification, job: dict) -> bool:
        """
        Send in-app notification.

        For production, this would integrate with a WebSocket server
        or push to a notification inbox in the database.
        """
        try:
            print(
                f"[Worker] Sending in-app notification to user {notification.user_id}"
            )
            print(f"[Worker]   Todo: {notification.todo_id}")
            print(f"[Worker]   Message: {notification.message or 'Todo reminder'}")

            # TODO: Implement actual in-app notification delivery
            # Options:
            # 1. WebSocket push via a message broker
            # 2. Store in notification inbox table
            # 3. Push to external notification service

            return True
        except Exception as e:
            print(f"[Worker] Failed to send in-app notification: {e}")
            return False

    def _send_email_notification(self, notification, job: dict) -> bool:
        """
        Send email notification.

        For production, this would integrate with an email service
        like SendGrid, AWS SES, or SMTP.
        """
        try:
            print(f"[Worker] Sending email notification to user {notification.user_id}")
            print(f"[Worker]   Todo: {notification.todo_id}")
            print(f"[Worker]   Message: {notification.message or 'Todo reminder'}")

            # TODO: Implement actual email delivery
            # Example with SendGrid:
            # from sendgrid import SendGridAPIClient
            # from sendgrid.helpers.mail import Mail
            #
            # user = get_user(notification.user_id)
            # message = Mail(
            #     from_email='noreply@axionsync.com',
            #     to_emails=user.email,
            #     subject='Todo Reminder',
            #     html_content=f'<p>{notification.message}</p>'
            # )
            # sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
            # sg.send(message)

            return True
        except Exception as e:
            print(f"[Worker] Failed to send email notification: {e}")
            return False

    def _send_push_notification(self, notification, job: dict) -> bool:
        """
        Send push notification to mobile/web devices.

        For production, this would integrate with:
        - Firebase Cloud Messaging (FCM) for Android/Web
        - Apple Push Notification Service (APNs) for iOS
        """
        try:
            print(f"[Worker] Sending push notification to user {notification.user_id}")
            print(f"[Worker]   Todo: {notification.todo_id}")
            print(f"[Worker]   Message: {notification.message or 'Todo reminder'}")

            # Get device tokens for user
            device_tokens = self.sql_notification.get_all_active_tokens_for_user(
                notification.user_id
            )

            if not device_tokens:
                print(
                    f"[Worker] No active device tokens for user {notification.user_id}"
                )
                return True  # Not an error, just no devices

            # TODO: Implement actual push notification delivery
            # Example with Firebase Admin SDK:
            # import firebase_admin
            # from firebase_admin import messaging
            #
            # for token_row in device_tokens:
            #     platform = token_row[3]
            #     device_token = token_row[2]
            #
            #     message = messaging.Message(
            #         notification=messaging.Notification(
            #             title='Todo Reminder',
            #             body=notification.message or 'You have a todo due!',
            #         ),
            #         token=device_token,
            #     )
            #
            #     try:
            #         messaging.send(message)
            #     except messaging.UnregisteredError:
            #         # Token is invalid, deactivate it
            #         self.sql_notification.deactivate_device_token(device_token)

            for token_row in device_tokens:
                print(f"[Worker]   -> Device: {token_row[3]} ({token_row[2][:20]}...)")

            return True
        except Exception as e:
            print(f"[Worker] Failed to send push notification: {e}")
            return False

    def get_stats(self) -> dict:
        """Get worker statistics"""
        queue_stats = self.redis_queue.get_queue_stats()
        return {
            "running": self.running,
            "poll_interval": self.poll_interval,
            "batch_size": self.batch_size,
            "queues": queue_stats,
        }


def run_worker():
    """Entry point for running the worker"""
    worker = NotificationWorker()
    worker.start()


if __name__ == "__main__":
    run_worker()
