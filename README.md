# Community Operating System (SOCM) v2.0

Sistema Operativo de Comunidades de Montes - Galicia

## 📁 Project Structure

```
Herramienta comunidades/
├── frontend/              # Next.js 14 (Vercel deployment)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (neighbor)/   # PWA Mobile Interface
│   │   │   └── (admin)/      # Desktop Dashboard
│   │   └── lib/
│   │       └── supabase.ts   # Supabase client
│   └── .env.local         # Supabase credentials
│
├── services/              # Python Backend Scripts
│   ├── import_census.py   # Excel → Supabase migration
│   ├── wind_tax.py        # Canon Eólico 2025 calculator
│   ├── groq_client.py     # AI legal text automation
│   ├── requirements.txt   # Python dependencies
│   └── .env               # API keys (Groq, Supabase)
│
└── supabase/              # Database Schema
    ├── schema.sql         # PostgreSQL + PostGIS tables
    └── config.toml        # Supabase configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd services
pip install -r requirements.txt
```

### 2. Configure Environment

**Frontend:** `.env.local` (already configured)
```env
NEXT_PUBLIC_SUPABASE_URL=https://nmgmsqsyafeocwztknpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Backend:** `services/.env` (already configured)
```env
GROQ_API_KEY_1=gsk_...
SUPABASE_URL=https://nmgmsqsyafeocwztknpc.supabase.co
SUPABASE_KEY=eyJ...
```

### 3. Apply Database Schema

**Option A: Supabase Dashboard**
1. Go to https://nmgmsqsyafeocwztknpc.supabase.co
2. SQL Editor → Copy contents of `supabase/schema.sql` → Run

**Option B: Supabase CLI**
```bash
supabase db push
```

### 4. Run Development Server

```bash
cd frontend
npm run dev
```

Open:
- **Neighbor Interface:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin

## 📚 Core Modules

### ✅ Module 1: Legal Shield (Census)
**File:** `services/import_census.py`

**Purpose:** Import existing Excel census to Supabase with validation.

**Usage:**
```python
from import_census import import_census

result = import_census("your_census.xlsx")
print(result)  # Shows valid/invalid records
```

**Features:**
- ✅ DNI validation (spanish-dni)
- ✅ Address normalization (libpostal)
- ✅ Error reporting

---

### ✅ Module 2: Financial Intelligence
**Files:** 
- `services/wind_tax.py` - Canon Eólico 2025 (tax calculator)
- `services/energy_audit_advanced.py` - **Complete production audit**

**Purpose:** Audit real energy production vs company payments with hourly price integration.

**Features:**
- ✅ **Historical Analysis:** Audit any date range (e.g., "Q1 2024", "Full year 2023")
- ✅ **ESIOS API:** Real hourly electricity prices from Spanish market
- ✅ **Correct Formula:** Revenue = Σ (production_hour × price_hour)
- ✅ **Solar Cannibalization:** Detects when solar produces during low-price hours
- ✅ **Wind Models:** Vestas V90, V162 with real power curves
- ✅ **PVGIS Integration:** European Commission solar irradiance data

**Usage:**
```python
from energy_audit_advanced import AdvancedEnergyAuditor

auditor = AdvancedEnergyAuditor(esios_token="your_token")

# Wind audit for Q1 2024
result = auditor.audit_wind_historical(
    lat=42.5, lon=-7.8,
    turbine_model="Vestas V90 3MW",
    num_turbines=10,
    start_date="2024-01-01",
    end_date="2024-03-31",
    company_payment=250000  # What company claims
)

# Solar audit for full year
result = auditor.audit_solar_historical(
    lat=42.5, lon=-7.8,
    peak_power_kwp=1000,
    year=2024,
    company_payment=45000
)
```

**Test Results:**
- Wind Q1 2024: 6,012 MWh → 259k€ estimated, company paid 250k€ → **3.57% discrepancy (OK)**
- Solar cannibalization effect: Captures 7% less than average market price due to midday oversupply

---

### ✅ Module 3: Antigravity (Legal Automation)
**File:** `services/groq_client.py`

**Purpose:** Generate formal Minutes (Actas) and analyze legal notifications.

**Usage:**
```python
from groq_client import GroqClient

client = GroqClient()  # Loads 8 API keys with rotation

# Generate Minutes
minutes = client.generate_minutes(
    raw_notes="Reunión 15 oct. Asisten 40 vecinos...",
    language="gallego"
)
print(minutes["content"])

# Analyze Notification
analysis = client.analyze_notification(
    notification_text="NOTIFICACIÓN XUNTA..."
)
print(analysis["content"])  # Risk level, deadline, action
```

**Features:**
- ✅ 8-key rotation (handles rate limits)
- ✅ Formal legal Gallego/Castellano output
- ✅ Tested with real assembly notes

---

## 🎨 Frontend Dichotomy UX

### Neighbor Interface (Mobile PWA)
**Routes:**
- `/` - Home (Assembly countdown, Dividends)
- Bottom Nav: Home, Notices, Panic Button

**Design:**
- Big touch-friendly buttons
- Gradient backgrounds (Green theme)
- Minimum text, maximum visuals

### Admin Dashboard (Desktop)
**Routes:**
- `/admin` - Dashboard (KPIs, Quick Actions)
- `/admin/census` - Census management
- `/admin/financial` - Economy & Wind Tax
- `/admin/antigravity` - Document automation

**Design:**
- Sidebar navigation
- Multi-column layout
- Data tables and charts

---

## 📋 Implementation Status

### ✅ Completed
- [x] Project initialization (Next.js + Supabase + Python)
- [x] Census migration tool with DNI validation
- [x] Canon Eólico 2025 calculator
- [x] Groq AI client (Minutes + Notifications)
- [x] Neighbor PWA interface
- [x] Admin Dashboard interface
- [x] Supabase schema (PostGIS enabled)

### 🔄 In Progress
- [ ] "Casa Aberta" residency algorithm
- [ ] Selenium bot for Xunta automation
- [ ] Real-time voting interface
- [ ] IBAN/SEPA dividend export

### 📅 Future Phases
- [ ] Auth0/Supabase Auth integration (Magic Links)
- [ ] MR652D PDF generation (fillpdf)
- [ ] Incident reporting map ("El Ojo del Vecino")
- [ ] Production deployment (Vercel + Supabase)

---

## 🔧 Technical Details

**Frontend:**
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase JS Client

**Backend:**
- Python 3.10+
- Libraries: pandas, spanish-dni, requests
- Groq API (Llama 3.3 70B)

**Database:**
- PostgreSQL 15 + PostGIS
- Supabase (500MB Free Tier)

**AI:**
- 8x Groq API keys (14k requests/day)
- Automatic rotation on rate limits

---

## 📞 Support

For questions or issues, refer to:
- Implementation Plan: `.gemini/antigravity/brain/.../implementation_plan.md`
- Walkthrough: `.gemini/antigravity/brain/.../walkthrough.md`
