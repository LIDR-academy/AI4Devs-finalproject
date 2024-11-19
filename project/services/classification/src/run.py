import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

import uvicorn
from config.settings import get_settings

settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )