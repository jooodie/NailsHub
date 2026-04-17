from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.fake_shops import MOCK_SHOPS


class ShopPublic(BaseModel):
    id: str
    name: str
    cover_image_url: str
    district: str
    summary: str


app = FastAPI(title="NailsHub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/shops", response_model=list[ShopPublic])
def list_shops() -> list[ShopPublic]:
    return [ShopPublic(**s) for s in MOCK_SHOPS]
