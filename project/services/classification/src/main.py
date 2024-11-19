from fastapi import FastAPI
from config.settings import get_settings
from controllers import classification_controller
from config.database import engine, Base

settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version
)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Registrar rutas
app.include_router(
    classification_controller.router,
    prefix=f"/api/{settings.api_version}/classification",
    tags=["classification"]
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 