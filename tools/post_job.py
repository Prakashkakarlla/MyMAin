#!/usr/bin/env python3
"""
JobFresh Job Poster
-------------------
Paste or pipe a raw job description — Claude extracts and structures it,
then posts it to https://api.jobfresh.in automatically.

Usage:
    python post_job.py job.txt          # from file
    python post_job.py                  # paste, Ctrl+Z (Windows) to finish
"""

import os
import sys
import json
import re
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

GROQ_API_KEY     = os.environ.get("GROQ_API_KEY", "")
JOBFRESH_API_URL = os.environ.get("JOBFRESH_API_URL", "https://api.jobfresh.in/api/v1")
ADMIN_EMAIL      = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD   = os.environ.get("ADMIN_PASSWORD", "")

GROQ_MODEL = "llama-3.3-70b-versatile"

# ── System prompt for Claude ──────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a job posting assistant for JobFresh.in, a job portal for fresh graduates in India.
Extract and structure job details from the provided raw text into a precise, COMPREHENSIVE JSON format.

IMPORTANT RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no explanation.
2. The fetched URL content may be sparse because many job sites use JavaScript rendering.
   In that case, USE YOUR OWN TRAINING KNOWLEDGE about the company, role, and hiring process to fill in rich details.
3. For well-known companies (TCS, Infosys, Wipro, NVIDIA, Google, Amazon, JPMorgan, HCL, Accenture, etc.)
   you have detailed knowledge of their hiring process, selection rounds, eligibility, and culture — use it fully.
4. ALWAYS generate at least 4-5 responsibilities, 5+ skills, 2-4 selection rounds with full details, 2-3 FAQs.
5. Never leave arrays empty if you can reasonably infer content from the company/role context.
6. Be specific and accurate — do not write generic filler. Use real facts about the company.

JSON structure (use null only for fields truly unknown):
{
  "title": "Exact job title",
  "company": "Company name",
  "location": "City1,City2,City3",
  "description": "2-3 sentence compelling description of the role",
  "type": "FULL_TIME" or "PART_TIME" or "REMOTE" or "INTERNSHIP" or "CONTRACT" or "WORK_FROM_HOME",
  "category": "IT / Software" or "Finance" or "Design" or "Marketing" or "Operations" or "Hardware" or appropriate category,
  "salary": "X – Y LPA" or "₹X,000 / month" or null,
  "applyUrl": "https://..." or null,
  "logoUrl": null,
  "degree": "BE_BTECH" or "ME_MTECH_MS" or "BCA_MCA" or "BSC" or "MBA_PGDM" or "BA_MA" or "DIPLOMA" or "ANY",
  "branch": "CS,IT,ECE,EEE" (comma-separated),
  "batch": "2024,2025,2026" (graduation years),
  "experienceLevel": "Fresher" or "0-1 years" etc,
  "minPercentage": 60.0 or null,
  "bond": null or "e.g. 1 year service agreement",
  "ageLimit": null or "e.g. 18-28 years",
  "lastDateToApply": "YYYY-MM-DD" or null,
  "examDate": null,
  "aboutCompany": "3-4 sentence detailed company background with founding year, HQ, size, key facts",
  "responsibilities": ["at least 5 specific responsibilities"],
  "requiredSkills": ["at least 6 relevant skills"],
  "documentsRequired": ["Resume", "Marksheets", etc.],
  "howToApply": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "selectionRounds": [
    {"order": 1, "title": "Round name", "description": "detailed description", "duration": "X minutes", "tip": "specific preparation tip", "icon": "FileText"}
  ],
  "faqs": [
    {"question": "Specific relevant question?", "answer": "Detailed accurate answer."}
  ],
  "importantLinks": [
    {"label": "Apply Here", "url": "https://..."}
  ],
  "active": true
}

Icon guide: FileText=aptitude/written/online test, Code=coding/technical, Users=HR/managerial, MessageCircle=interview/telephonic"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_url_content(url: str) -> str:
    """Fetch a job page URL and return cleaned plain text (max 6000 chars)."""
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        html = resp.text
        html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r"<style[^>]*>.*?</style>",  " ", html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"&[a-zA-Z]+;", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text[:6000]
    except Exception:
        return ""


def get_auth_token() -> str:
    resp = requests.post(
        f"{JOBFRESH_API_URL}/auth/token",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15
    )
    if resp.status_code == 401:
        sys.exit("❌ Auth failed — check ADMIN_EMAIL and ADMIN_PASSWORD in .env")
    resp.raise_for_status()
    return resp.json()["data"]["token"]


def extract_job_data(job_text: str) -> dict:
    # Auto-fetch any URLs found in the pasted text
    urls = re.findall(r"https?://[^\s]+", job_text)
    extra = ""
    if urls:
        print(f"   🌐 Fetching job page: {urls[0]}")
        content = fetch_url_content(urls[0])
        if content:
            extra = f"\n\n--- Content fetched from {urls[0]} ---\n{content}"

    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        max_tokens=8192,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"The following is a detailed job posting. Extract EVERY detail into the JSON — do not skip or summarise any FAQs, responsibilities, rounds, or skills. Include all of them completely:\n\n{job_text}{extra}"}
        ]
    )
    raw = completion.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw.strip())


def post_job(job_data: dict, token: str) -> dict:
    resp = requests.post(
        f"{JOBFRESH_API_URL}/admin/jobs",
        json=job_data,
        headers={"Authorization": f"Bearer {token}"},
        timeout=20
    )
    if resp.status_code == 401:
        sys.exit("❌ Token rejected — try again")
    if not resp.ok:
        sys.exit(f"❌ API error {resp.status_code}: {resp.text}")
    return resp.json()


def make_slug(title: str, company: str, job_type: str, job_id: int) -> str:
    def slugify(s):
        return re.sub(r"-+", "-",
               re.sub(r"[^\w\s-]", "",
               (s or "").lower())
               .replace(" ", "-")).strip("-")
    t = slugify(title)
    c = slugify(company)
    ty = (job_type or "").lower().replace("_", "-")
    return f"{t}-{c}-{ty}-{job_id}"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # Validate env
    missing = [k for k in ("GROQ_API_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD")
               if not os.environ.get(k)]
    if missing:
        sys.exit(f"❌ Missing env vars: {', '.join(missing)}\n   Copy .env.example → .env and fill in values.")

    # Read input
    if len(sys.argv) > 1:
        path = sys.argv[1]
        with open(path, "r", encoding="utf-8") as f:
            job_text = f.read()
        print(f"📄 Reading from {path}")
    else:
        print("📋 Paste job description below. Press Ctrl+Z then Enter (Windows) or Ctrl+D (Mac/Linux) when done:\n")
        job_text = sys.stdin.read()

    if not job_text.strip():
        sys.exit("❌ No input provided.")

    # Extract with Groq
    print("\n🤖 Sending to Groq (Llama 3.3 70B) for extraction...")
    try:
        job_data = extract_job_data(job_text)
    except json.JSONDecodeError as e:
        sys.exit(f"❌ Groq returned invalid JSON: {e}")

    # Preview
    print(f"\n{'─'*60}")
    print(f"  Title    : {job_data.get('title')}")
    print(f"  Company  : {job_data.get('company')}")
    print(f"  Type     : {job_data.get('type')}")
    print(f"  Location : {job_data.get('location')}")
    print(f"  Salary   : {job_data.get('salary')}")
    print(f"  Batch    : {job_data.get('batch')}")
    print(f"  Skills   : {', '.join(job_data.get('requiredSkills') or [])}")
    print(f"  Rounds   : {len(job_data.get('selectionRounds') or [])} selection rounds")
    print(f"{'─'*60}")

    # Fill in required fields that AI couldn't infer
    VALID_TYPES = ["FULL_TIME", "PART_TIME", "REMOTE", "INTERNSHIP", "CONTRACT", "WORK_FROM_HOME"]
    if not job_data.get("type"):
        print(f"\n⚠️  Job type missing. Options: {', '.join(VALID_TYPES)}")
        t = input("   Enter type: ").strip().upper().replace(" ", "_")
        job_data["type"] = t if t in VALID_TYPES else "FULL_TIME"
    if not job_data.get("location"):
        job_data["location"] = input("⚠️  Location missing. Enter city/cities: ").strip()

    show_full = input("\nShow full JSON before posting? [y/N] ").strip().lower()
    if show_full == "y":
        print(json.dumps(job_data, indent=2, ensure_ascii=False))

    confirm = input("\n✅ Post this job to JobFresh? [y/N] ").strip().lower()
    if confirm != "y":
        print("Cancelled. JSON saved to last_job.json for review.")
        with open("last_job.json", "w", encoding="utf-8") as f:
            json.dump(job_data, f, indent=2, ensure_ascii=False)
        return

    # Authenticate + Post
    print("\n🔐 Authenticating...")
    token = get_auth_token()

    print("📤 Posting job...")
    result = post_job(job_data, token)

    job_id = result["data"]["id"]
    slug = make_slug(job_data.get("title", ""), job_data.get("company", ""), job_data.get("type", ""), job_id)
    url = f"https://jobfresh.in/jobs/{slug}"

    print(f"\n✅ Job posted successfully!")
    print(f"   ID  : {job_id}")
    print(f"   URL : {url}")


if __name__ == "__main__":
    main()
