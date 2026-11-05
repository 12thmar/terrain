# Terrain — Coffee Supply Chain Traceability Platform

## Context

Thomas (Red Drum Roasters) won't buy without full sourcing transparency: farm → washing station → price breakdown per party. He currently pays $6.55 for G2 Guji that's traceable to the washing station manager and individual farmers. He'd pay $9–$20 for excellent coffee with that same transparency — but only if it's there.

The goal: a standalone supplier portal where Bunaroots' suppliers (or their reps) log in, register their farms with GPS-tagged photos, link to washing stations, and submit cost breakdowns per lot. All data lives in Odoo (buna-serat), which becomes the source of truth. This eventually surfaces on bunaroots.com so roasters see full traceability before buying.

Terrain is built as a multi-tenant platform — Bunaroots is the first customer, but any importer can use it.

---

## Entity Model

Seven core entities. All stored as custom Odoo models (addon: `terrain_sourcing`).

```
Organization (res.company)
  └── Supplier ──< Farm ──< Farmer
                       ├──> Washing Station(s)
                       └──< Coffee Lot ──── Price Breakdown
```

### 1. `terrain.supplier` (extends `res.partner`)
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation — required on all models |
| supplier_code | Char | e.g. ETH-HAD-001 |
| is_supplier | Boolean | flag on res.partner |
| certifications | Char | organic, fair trade, etc. |
| portal_user_id | Many2one → res.users | login account |

### 2. `terrain.farm`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| name | Char | farm name |
| supplier_id | Many2one → terrain.supplier | |
| region | Char | Guji, Yirgacheffe, Sidama… |
| zone | Char | sub-region |
| altitude_min / max | Integer | masl |
| latitude / longitude | Float | extracted from photo EXIF or manual |
| size_hectares | Float | |
| variety | Char | Heirloom Ethiopian, etc. |
| harvest_months | Char | e.g. "Oct–Jan" |
| photos | One2many → terrain.farm.photo | |
| state | Selection | draft / submitted / approved / active |

### 3. `terrain.farm.photo`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| farm_id | Many2one → terrain.farm | |
| s3_url | Char | photo URL in S3 |
| lat / lng | Float | EXIF-extracted GPS |
| taken_at | Date | |

### 4. `terrain.farmer`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| name | Char | |
| farm_id | Many2one → terrain.farm | |
| phone | Char | |
| years_experience | Integer | |
| photo_url | Char | S3 |

### 5. `terrain.washing_station`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| name | Char | e.g. Gigesa Washing Station |
| supplier_id | Many2one → terrain.supplier | |
| farm_ids | Many2many → terrain.farm | farms it receives from |
| latitude / longitude | Float | |
| altitude | Integer | masl |
| mill_type | Selection | wet / dry / both |
| capacity_kg_day | Integer | |
| certifications | Char | |

### 6. `terrain.coffee.lot`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| lot_code | Char | e.g. 030905 |
| supplier_id | Many2one → terrain.supplier | |
| farm_ids | Many2many → terrain.farm | |
| washing_station_id | Many2one → terrain.washing_station | |
| name | Char | Yirgacheffe, Sidamo… |
| grade | Integer | 1–5 |
| process | Selection | washed / natural / honey |
| variety | Char | |
| altitude_range | Char | "1,700 – 2,200 masl" |
| harvest_date | Date | |
| export_ready_date | Date | |
| moisture_pct | Float | |
| screen_size | Char | "15/16" |
| bag_weight_kg | Integer | |
| flavor_notes | Text | |
| sca_score | Float | optional |

### 7. `terrain.price.breakdown`
| Field | Type | Notes |
|---|---|---|
| company_id | Many2one → res.company | multi-tenant isolation |
| lot_id | One2one → terrain.coffee.lot | |
| farmer_pct | Float | % of FOB that reaches farmer |
| washing_station_pct | Float | |
| incountry_buyer_pct | Float | |
| shipping_pct | Float | |
| importer_pct | Float | |
| fob_price_usd | Float | $/kg |
| landed_price_usd | Float | $/kg |
| notes | Text | narrative explanation |

---

## App Stack

| Layer | Tech | Reference |
|---|---|---|
| Frontend | React + Vite + Tailwind | same as buna-sinni |
| Backend | Laravel | same as buna-jebena |
| File storage | AWS S3 — dedicated bucket | `terrain-uploads-prod` / `terrain-uploads-dev` |
| Data store | Odoo 18 JSON-RPC | crm.bunaroots.com:8069 |
| Auth | Google OAuth (laravel/socialite) | same pattern as outreach.bunaroots.com |

### Auth Pattern — Google OAuth (laravel/socialite)
Mirrors `outreach.bunaroots.com` (buna-qetema/dashboard/server.js):
- Supplier clicks "Sign in with Google"
- `laravel/socialite` handles the Google OAuth flow
- On callback: check if email exists in local `suppliers` table (the allowlist)
- If not found → reject with "your account is not authorized"
- If found → grab `odoo_id`, create Laravel session scoped to that supplier
- Bunaroots admin adds supplier emails before they can log in (same as roles.json pattern)
- Roles: `admin` (Bunaroots staff, sees all orgs) · `supplier` (sees only their own data)

### Two-Table Split: Local DB vs Odoo

**Local Laravel DB** — auth only, lightweight:
```
suppliers
  id
  email       ← what Google Auth checks against
  role        ← admin / supplier
  odoo_id     ← FK to terrain.supplier in Odoo (nullable until synced)
  timestamps
```

**Odoo** — full business profile:
```
terrain.supplier   (extends res.partner)
  supplier_code, certifications, portal_user_id
  → farms, washing stations, lots, price breakdowns
```

Flow: Google login → email found in local `suppliers` → `odoo_id` loaded into session → all data ops scoped to that Odoo record. Same bridge pattern as buna-jebena's `leads` table with `odoo_id`.

### Reuse from buna-jebena
- `app/Services/OdooClient.php` — copy & extend with new model methods
- `config/services.php` — `ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD` env vars
- `config/filesystems.php` — S3 disk config (reference pattern only; Terrain gets its own bucket)
- Migration pattern: `odoo_id` nullable field on every local table for async sync

### GPS Extraction Strategy
- **Client-side first**: `exifr` JS library reads GPS from EXIF before upload — zero server cost
- **Server fallback**: If no EXIF, supplier pins location on a Leaflet.js map
- Store both `exif_lat/lng` (from photo) and `confirmed_lat/lng` (from map pin) separately

---

## Odoo Addon: `terrain_sourcing`

Goes into `buna-serat` at `/mnt/extra-addons/terrain_sourcing/`. The docker-compose.yaml already has the volume mount commented out — just needs uncommenting.

```
terrain_sourcing/
  __manifest__.py
  models/
    supplier.py
    farm.py
    farm_photo.py
    farmer.py
    washing_station.py
    coffee_lot.py
    price_breakdown.py
  views/
    farm_views.xml
    lot_views.xml
  security/
    ir.model.access.csv
```

---

## Implementation Phases

### Phase 1 — Odoo Addon (buna-serat)
Define all 7 models with relationships and security rules. Enable addon in dev.

### Phase 2 — App Scaffold (terrain)
- Laravel backend: supplier auth, S3 upload endpoint, OdooClient for terrain models
- React frontend: portal shell, login page, supplier dashboard skeleton

### Phase 3 — Farm + Location
- Farm registration form (name, region, altitude, variety)
- Photo upload with client-side EXIF GPS extraction
- Leaflet.js map fallback for manual pin
- Farm profile page

### Phase 4 — Farmer + Washing Station
- Farmer profile form (linked to farm)
- Washing station registration
- Many-to-many farm ↔ washing station linking

### Phase 5 — Lots + Price Breakdown
- Coffee lot submission form
- Price breakdown form (the Thomas requirement)
- Read-only public traceability URL per lot

### Phase 6 — Surface on bunaroots.com
- Pull lot + farm data from Odoo into buna-sinni product pages
- Roasters see full chain before buying

---

## Decisions Made

- **Platform name**: Terrain (`terrain.io`)
- **Multi-tenancy**: Each customer org = one `res.company` in Odoo. Bunaroots is company 1.
- **Odoo hosting**: Use existing buna-serat until profitable, then migrate to a dedicated instance
- **S3**: Dedicated buckets — `terrain-uploads-prod` / `terrain-uploads-dev`. Clean separation from buna-jebena; easy migration later.
- **Prompted by**: Thomas @ Red Drum Roasters feedback, 2026-10-27
