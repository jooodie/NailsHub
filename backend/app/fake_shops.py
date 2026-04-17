"""MVP 假資料，之後改為 DB 查詢。"""

MOCK_SHOPS: list[dict[str, str]] = [
    {
        "id": "shop-001",
        "name": "晨光美甲工作室",
        "cover_image_url": "https://picsum.photos/seed/nails1/800/500",
        "district": "中西區",
        "summary": "手繪花卉與漸層專長，舒適一對一服務。",
    },
    {
        "id": "shop-002",
        "name": "南薑指彩",
        "cover_image_url": "https://picsum.photos/seed/nails2/800/500",
        "district": "東區",
        "summary": "日系簡約、凝膠指甲與足部保養。",
    },
    {
        "id": "shop-003",
        "name": "海安街美甲館",
        "cover_image_url": "https://picsum.photos/seed/nails3/800/500",
        "district": "中西區",
        "summary": "鄰近海安路，夜間營業方便下班後預約。",
    },
]
