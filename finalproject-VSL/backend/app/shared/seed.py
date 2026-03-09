"""
Seed script: creates the initial prompt version and a sample conversation.
Run with: python -m app.shared.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.shared.database import SessionLocal, engine, Base
from app.shared.models import PromptVersion, Conversation, Message, MessageRole

Base.metadata.create_all(bind=engine)

INITIAL_PROMPT = """You are a helpful and friendly customer service assistant for a generic e-commerce store.

Your responsibilities:
- Answer questions about products, orders, shipping, and returns
- Be concise, clear, and polite
- If you don't know something specific, acknowledge it and offer to connect the user with a human agent
- Never make up specific order details or product information you don't have

Always respond in the same language the user writes in."""

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(PromptVersion).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        # Create initial prompt version
        prompt_v1 = PromptVersion(
            version_number=1,
            content=INITIAL_PROMPT,
            is_active=True,
            created_by="system"
        )
        db.add(prompt_v1)

        # Create a sample conversation for demo
        conv = Conversation(
            session_id="demo-session-001",
            user_identifier="demo-user@example.com"
        )
        db.add(conv)
        db.flush()

        messages = [
            Message(conversation_id=conv.id, role=MessageRole.user,
                    content="Hi, I ordered something 3 days ago and haven't received a tracking number."),
            Message(conversation_id=conv.id, role=MessageRole.assistant,
                    content="I understand your concern! Tracking numbers are usually sent within 24-48 hours after shipping. Please check your spam folder. If you still don't see it, I recommend contacting our support team directly with your order number."),
            Message(conversation_id=conv.id, role=MessageRole.user,
                    content="My order number is #12345. Can you check the status?"),
            Message(conversation_id=conv.id, role=MessageRole.assistant,
                    content="I'm sorry, but I don't have direct access to our order management system to look up specific order details. For order #12345, I recommend using our website's order tracking page or contacting our support team at support@example.com. They can provide real-time status updates!"),
        ]
        for msg in messages:
            db.add(msg)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   - Created prompt version 1 (active)")
        print(f"   - Created sample conversation with {len(messages)} messages")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
