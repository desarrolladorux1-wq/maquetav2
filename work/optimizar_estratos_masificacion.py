import json
import math
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "geo" / "Estratos_INEI.geojson"
TARGET = ROOT / "geo" / "masificacion_estratos_inei.geojson"

PROJECTS = [
    ("MAS-001", "LIMA", "COMAS", -77.06, -11.94),
    ("MAS-002", "LIMA", "VILLA EL SALVADOR", -76.94, -12.21),
    ("MAS-003", "AREQUIPA", "CERRO COLORADO", -71.56, -16.37),
    ("MAS-004", "LA LIBERTAD", "TRUJILLO", -79.03, -8.11),
    ("MAS-005", "LAMBAYEQUE", "JOSE LEONARDO ORTIS", -79.84, -6.76),
    ("MAS-006", "CUSCO", "SAN SEBASTIAN", -71.89, -13.53),
    ("MAS-007", "PIURA", "CASTILLA", -80.63, -5.19),
    ("MAS-008", "ICA", "SUBTANJALLA", -75.76, -14.02),
    ("MAS-009", "JUNIN", "EL TAMBO", -75.22, -12.04),
    ("MAS-010", "ANCASH", "NUEVO CHIMBOTE", -78.52, -9.12),
]


def normalize(value):
    text = unicodedata.normalize("NFD", str(value or ""))
    return "".join(char for char in text if unicodedata.category(char) != "Mn").upper().strip()


def first_ring(geometry):
    coordinates = geometry.get("coordinates") or []
    if geometry.get("type") == "MultiPolygon" and coordinates and coordinates[0]:
        return coordinates[0][0]
    if geometry.get("type") == "Polygon" and coordinates:
        return coordinates[0]
    return []


def center(feature):
    ring = first_ring(feature.get("geometry") or {})
    if not ring:
        return None
    xs = [point[0] for point in ring]
    ys = [point[1] for point in ring]
    return ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)


def perpendicular_distance(point, start, end):
    if start == end:
        return math.dist(point, start)
    dx, dy = end[0] - start[0], end[1] - start[1]
    numerator = abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0])
    return numerator / math.hypot(dx, dy)


def simplify_line(points, tolerance=0.000012):
    if len(points) <= 4:
        return points
    closed = points[0] == points[-1]
    work = points[:-1] if closed else points
    if len(work) <= 3:
        result = work
    else:
        start, end = work[0], work[-1]
        distances = [perpendicular_distance(point, start, end) for point in work[1:-1]]
        maximum = max(distances, default=0)
        if maximum > tolerance:
            index = distances.index(maximum) + 1
            left = simplify_line(work[: index + 1], tolerance)
            right = simplify_line(work[index:], tolerance)
            result = left[:-1] + right
        else:
            result = [start, end]
    if closed and result[0] != result[-1]:
        result.append(result[0])
    if closed and len(result) < 4:
        return points
    return result


def simplify_coordinates(coordinates):
    simplified = []
    for polygon in coordinates:
        rings = []
        for ring in polygon:
            rounded = [[round(point[0], 5), round(point[1], 5)] for point in ring]
            rings.append(simplify_line(rounded))
        simplified.append(rings)
    return simplified


with SOURCE.open(encoding="utf-8-sig") as handle:
    collection = json.load(handle)

candidates = {code: [] for code, *_ in PROJECTS}
for feature in collection.get("features", []):
    properties = feature.get("properties") or {}
    department = normalize(properties.get("DEPARTAMENTO"))
    district = normalize(properties.get("DISTRITO"))
    for code, expected_department, expected_district, longitude, latitude in PROJECTS:
        if department != expected_department or district != expected_district:
            continue
        point = center(feature)
        if point:
            distance = math.hypot(point[0] - longitude, point[1] - latitude)
            candidates[code].append((distance, feature))
        break

features = []
seen = set()
for code, expected_department, expected_district, longitude, latitude in PROJECTS:
    # Conservamos todos los estratos reales del distrito. El límite anterior de
    # 700 producía una mancha incompleta alrededor del centro del proyecto.
    for _, feature in sorted(candidates[code], key=lambda item: item[0]):
        properties = feature.get("properties") or {}
        object_id = properties.get("OBJECTID")
        key = (code, object_id)
        if key in seen:
            continue
        seen.add(key)
        geometry = feature.get("geometry") or {}
        features.append({
            "type": "Feature",
            "properties": {
                "OBJECTID": object_id,
                "IDMANZANA": properties.get("IDMANZANA"),
                "DEPARTAMENTO": properties.get("DEPARTAMENTO"),
                "PROVINCIA": properties.get("PROVINCIA"),
                "DISTRITO": properties.get("DISTRITO"),
                "ESTRATO": properties.get("ESTRATO"),
                "ESTRA": properties.get("ESTRA"),
                "CIUDAD": properties.get("CIUDAD"),
                "PROYECTO": code,
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": simplify_coordinates(geometry.get("coordinates") or []),
            },
        })

output = {"type": "FeatureCollection", "features": features}
with TARGET.open("w", encoding="utf-8") as handle:
    json.dump(output, handle, ensure_ascii=False, separators=(",", ":"))

print(json.dumps({
    "source_mb": round(SOURCE.stat().st_size / 1024 / 1024, 2),
    "target_mb": round(TARGET.stat().st_size / 1024 / 1024, 2),
    "features": len(features),
    "per_project": {code: len(candidates[code]) for code, *_ in PROJECTS},
}, ensure_ascii=False))
