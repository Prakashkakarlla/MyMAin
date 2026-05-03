#!/usr/bin/env python3
"""
JobFresh Telegram Bot
---------------------
Send a job description in Telegram → AI extracts it → one tap to post to jobfresh.in

Setup:
  1. Create bot via @BotFather → copy token → add TELEGRAM_BOT_TOKEN to .env
  2. python telegram_bot.py
"""

import os
import json
import re
import requests
from datetime import date, datetime
from groq import Groq
from dotenv import load_dotenv
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

TELEGRAM_TOKEN   = os.environ.get("TELEGRAM_BOT_TOKEN", "")
GROQ_API_KEY     = os.environ.get("GROQ_API_KEY", "")
JOBFRESH_API_URL = os.environ.get("JOBFRESH_API_URL", "https://api.jobfresh.in/api/v1")
ADMIN_EMAIL      = os.environ.get("ADMIN_EMAIL", "")
ADMIN_PASSWORD   = os.environ.get("ADMIN_PASSWORD", "")
GROQ_MODEL       = "llama-3.3-70b-versatile"

# ── System prompt ─────────────────────────────────────────────────────────────

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

JSON structure (use null only for fields truly unknown, omit nothing):
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
  "branch": "CS,IT,ECE,EEE",
  "batch": "2024,2025,2026",
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
    {"order": 1, "title": "Round name", "description": "detailed description of what happens", "duration": "X minutes", "tip": "specific preparation tip", "icon": "FileText"}
  ],
  "faqs": [
    {"question": "Specific relevant question?", "answer": "Detailed accurate answer."}
  ],
  "importantLinks": [
    {"label": "Apply Here", "url": "https://..."}
  ],
  "active": true
}

Icon guide: FileText=aptitude/written/online test, Code=coding/technical round, Users=HR/group discussion/managerial, MessageCircle=interview/telephonic"""


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


def extract_job_data(job_text: str, status_callback=None) -> dict:
    # Auto-fetch any URLs found in the pasted text
    urls = re.findall(r"https?://[^\s]+", job_text)
    extra = ""
    if urls:
        if status_callback:
            status_callback(f"🌐 Fetching job page content...")
        content = fetch_url_content(urls[0])
        if content:
            extra = f"\n\n--- Content fetched from {urls[0]} ---\n{content}"

    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        max_tokens=8192,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": f"The following is a detailed job posting. Extract EVERY detail into the JSON — do not skip or summarise any FAQs, responsibilities, rounds, or skills. Include all of them completely:\n\n{job_text}{extra}"}
        ]
    )
    raw = completion.choices[0].message.content.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw.strip())


def get_auth_token() -> str:
    resp = requests.post(
        f"{JOBFRESH_API_URL}/auth/token",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=15
    )
    resp.raise_for_status()
    return resp.json()["data"]["token"]


def post_job(job_data: dict, token: str) -> dict:
    resp = requests.post(
        f"{JOBFRESH_API_URL}/admin/jobs",
        json=job_data,
        headers={"Authorization": f"Bearer {token}"},
        timeout=20
    )
    if not resp.ok:
        raise Exception(f"API {resp.status_code}: {resp.text}")
    return resp.json()


def make_slug(title: str, company: str, job_type: str, job_id: int) -> str:
    def slugify(s):
        return re.sub(r"-+", "-",
               re.sub(r"[^\w\s-]", "",
               (s or "").lower()).replace(" ", "-")).strip("-")
    return f"{slugify(title)}-{slugify(company)}-{(job_type or '').lower().replace('_','-')}-{job_id}"


def h(text) -> str:
    """Escape special HTML characters in dynamic content."""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def relative_date(date_str: str) -> str:
    """Convert ISO date/datetime string to Today / Yesterday / DD MMM YYYY."""
    if not date_str:
        return "—"
    try:
        d = datetime.fromisoformat(date_str[:19]).date()
        today = date.today()
        delta = (today - d).days
        if delta == 0:
            return "Today"
        if delta == 1:
            return "Yesterday"
        return d.strftime("%d %b %Y")
    except Exception:
        return date_str[:10]


def build_preview(job_data: dict) -> str:
    lines = ["📋 <b>FULL JOB PREVIEW</b>\n"]

    # ── Basic info ────────────────────────────────────────────────────────────
    lines.append(f"<b>Title:</b>      {h(job_data.get('title', 'N/A'))}")
    lines.append(f"<b>Company:</b>    {h(job_data.get('company', 'N/A'))}")
    lines.append(f"<b>Type:</b>       {h(job_data.get('type') or '⚠️ FULL_TIME (defaulted)')}")
    lines.append(f"<b>Location:</b>   {h(job_data.get('location') or '⚠️ India (defaulted)')}")
    lines.append(f"<b>Category:</b>   {h(job_data.get('category') or '—')}")
    lines.append(f"<b>Salary:</b>     {h(job_data.get('salary') or '—')}")
    lines.append(f"<b>Degree:</b>     {h(job_data.get('degree') or '—')}")
    lines.append(f"<b>Branch:</b>     {h(job_data.get('branch') or '—')}")
    lines.append(f"<b>Batch:</b>      {h(job_data.get('batch') or '—')}")
    lines.append(f"<b>Experience:</b> {h(job_data.get('experienceLevel') or '—')}")
    lines.append(f"<b>Min %:</b>      {h(job_data.get('minPercentage') or '—')}")
    lines.append(f"<b>Bond:</b>       {h(job_data.get('bond') or '—')}")
    lines.append(f"<b>Age Limit:</b>  {h(job_data.get('ageLimit') or '—')}")
    lines.append(f"<b>Last Date:</b>  {h(job_data.get('lastDateToApply') or '—')}")

    # ── About Company ─────────────────────────────────────────────────────────
    about = (job_data.get("aboutCompany") or "").strip()
    if about:
        lines.append(f"\n<b>About Company:</b>\n{h(about[:300])}{'...' if len(about) > 300 else ''}")

    # ── Responsibilities ──────────────────────────────────────────────────────
    resp = job_data.get("responsibilities") or []
    if resp:
        lines.append(f"\n<b>Responsibilities:</b>")
        for r in resp[:5]:
            lines.append(f"  • {h(r)}")
        if len(resp) > 5:
            lines.append(f"  <i>...and {len(resp)-5} more</i>")

    # ── Skills ────────────────────────────────────────────────────────────────
    skills = job_data.get("requiredSkills") or []
    if skills:
        lines.append(f"\n<b>Skills:</b> {h(', '.join(skills))}")

    # ── Selection Rounds ──────────────────────────────────────────────────────
    rounds = job_data.get("selectionRounds") or []
    if rounds:
        lines.append(f"\n<b>Selection Rounds ({len(rounds)}):</b>")
        for r in rounds:
            dur = f" ({h(r.get('duration',''))})" if r.get("duration") else ""
            lines.append(f"  {r.get('order','')}.  <b>{h(r.get('title',''))}</b>{dur}")
            desc = (r.get("description") or "")[:120]
            lines.append(f"      {h(desc)}")
            if r.get("tip"):
                lines.append(f"      <i>Tip: {h(r['tip'][:100])}</i>")

    # ── FAQs ──────────────────────────────────────────────────────────────────
    faqs = job_data.get("faqs") or []
    if faqs:
        lines.append(f"\n<b>FAQs ({len(faqs)}):</b>")
        for f in faqs[:3]:
            lines.append(f"  ❓ {h(f.get('question',''))}")
            lines.append(f"      {h((f.get('answer') or '')[:120])}")

    # ── Apply URL ─────────────────────────────────────────────────────────────
    if job_data.get("applyUrl"):
        lines.append(f"\n<b>Apply URL:</b> {h(job_data['applyUrl'])}")

    lines.append("\n─────────────────────────────")
    lines.append("Post this job to JobFresh.in?")

    # Telegram message limit is 4096 chars — truncate if needed
    text = "\n".join(lines)
    if len(text) > 4000:
        text = text[:3950] + "\n...<i>(truncated)</i>\n\nPost this job to JobFresh.in?"
    return text


def confirm_keyboard() -> InlineKeyboardMarkup:
    kb = InlineKeyboardMarkup()
    kb.row(
        InlineKeyboardButton("✅  Post Job", callback_data="confirm_post"),
        InlineKeyboardButton("❌  Cancel",   callback_data="cancel")
    )
    return kb


# ── Bot ───────────────────────────────────────────────────────────────────────

bot = telebot.TeleBot(TELEGRAM_TOKEN)

# chat_id → extracted job_data (pending confirmation)
pending_jobs: dict = {}

# chat_id → buffered JSON chunks (handles Telegram splitting long messages)
json_buffers: dict = {}
buffer_status_msg: dict = {}


@bot.message_handler(commands=["start", "help"])
def cmd_start(message):
    bot.send_message(message.chat.id,
        "👋 <b>Welcome to JobFresh Job Poster Bot!</b>\n\n"
        "<b>Mode 1 — AI Extraction:</b>\n"
        "Paste any job description (URL, LinkedIn, plain text) and Groq AI extracts all details.\n\n"
        "<b>Mode 2 — Direct JSON:</b>\n"
        "Ask Claude to generate the job JSON, then paste it here — AI step is skipped entirely.\n\n"
        "<b>How to use:</b>\n"
        "1. Paste job description or JSON\n"
        "2. Review the full preview\n"
        "3. Tap ✅ Post Job\n\n"
        "/jobs — last 10 posted jobs with status &amp; date\n"
        "/subscribers — list all active subscribers\n"
        "/cancel — cancel current job",
        parse_mode="HTML"
    )


@bot.message_handler(commands=["cancel"])
def cmd_cancel(message):
    pending_jobs.pop(message.chat.id, None)
    json_buffers.pop(message.chat.id, None)
    buffer_status_msg.pop(message.chat.id, None)
    bot.reply_to(message, "❌ Cancelled.")


@bot.message_handler(commands=["jobs"])
def cmd_jobs(message):
    try:
        token = get_auth_token()
        resp = requests.get(
            f"{JOBFRESH_API_URL}/admin/jobs?page=0&size=10",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15
        )
        resp.raise_for_status()
        page = resp.json().get("data", {})
        jobs = page.get("content", [])
        total = page.get("totalElements", 0)

        if not jobs:
            bot.reply_to(message, "No jobs posted yet.")
            return

        lines = [f"📋 <b>Recent Jobs (Total: {total})</b>\n"]
        for j in jobs:
            status  = "🟢" if j.get("active") else "🔴"
            posted  = relative_date(j.get("postedAt") or "")
            salary  = h(j.get("salary") or "—")
            lines.append(
                f"{status} <b>{h(j['title'])}</b> — {h(j['company'])}\n"
                f"   📍 {h(j.get('location','—'))}  💰 {salary}  🕐 {posted}\n"
                f"   ID: <code>{j['id']}</code>\n"
            )

        text = "\n".join(lines)
        if len(text) > 4000:
            text = text[:3950] + "\n...<i>(truncated)</i>"
        bot.send_message(message.chat.id, text, parse_mode="HTML")

    except Exception as e:
        bot.reply_to(message, f"❌ Failed: {str(e)[:200]}")


@bot.message_handler(commands=["subscribers"])
def cmd_subscribers(message):
    try:
        token = get_auth_token()
        resp = requests.get(
            f"{JOBFRESH_API_URL}/admin/subscribers",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15
        )
        resp.raise_for_status()
        subs = resp.json().get("data", [])
        if not subs:
            bot.reply_to(message, "No active subscribers.")
            return

        lines = [f"👥 <b>Subscribers ({len(subs)})</b>\n"]
        for i, s in enumerate(subs, 1):
            cat   = h(s.get("preferredCategory") or "Any")
            since = relative_date(s.get("subscribedAt") or "")
            lines.append(f"{i}. <code>{h(s['email'])}</code>")
            lines.append(f"   Category: {cat}  |  Since: {since}")

        text = "\n".join(lines)
        if len(text) > 4000:
            text = text[:3950] + "\n...<i>(truncated)</i>"
        bot.send_message(message.chat.id, text, parse_mode="HTML")

    except Exception as e:
        bot.reply_to(message, f"❌ Failed: {str(e)[:200]}")


def process_job_data(chat_id: int, job_data: dict, status_msg_id: int):
    """Fill defaults, store, and show preview with confirm buttons."""
    if not job_data.get("type"):
        job_data["type"] = "FULL_TIME"
    if not job_data.get("location"):
        job_data["location"] = "India"
    pending_jobs[chat_id] = job_data
    bot.edit_message_text(
        build_preview(job_data),
        chat_id,
        status_msg_id,
        parse_mode="HTML",
        reply_markup=confirm_keyboard()
    )


@bot.message_handler(func=lambda m: m.text and not m.text.startswith("/"))
def handle_job_text(message):
    chat_id = message.chat.id
    job_text = message.text.strip()

    if len(job_text) < 15:
        bot.reply_to(message, "⚠️ Too short. Please paste a full job description.")
        return

    # ── JSON buffer mode: accumulate split chunks ─────────────────────────────
    # Telegram splits messages >4096 chars into multiple parts.
    # Multiple chunks arrive in parallel threads — use pop() as atomic claim.
    if chat_id in json_buffers or job_text.startswith("{"):
        if chat_id not in json_buffers:
            json_buffers[chat_id] = job_text
            try:
                status_msg = bot.send_message(chat_id, "📥 Receiving JSON... (collecting parts)")
                buffer_status_msg[chat_id] = status_msg.message_id
            except Exception:
                pass
        else:
            json_buffers[chat_id] = json_buffers.get(chat_id, "") + job_text

        accumulated = json_buffers.get(chat_id)
        if not accumulated:
            return  # another thread already claimed and cleared this buffer

        try:
            job_data = json.loads(accumulated)
        except json.JSONDecodeError:
            return  # incomplete — wait for more chunks

        # Valid JSON — claim the buffer (only one thread wins the pop)
        if json_buffers.pop(chat_id, None) is None:
            return  # another thread already claimed it

        status_msg_id = buffer_status_msg.pop(chat_id, None)
        if status_msg_id:
            try:
                bot.edit_message_text("✅ JSON complete — building preview...", chat_id, status_msg_id)
            except Exception:
                pass
        else:
            m = bot.send_message(chat_id, "✅ JSON complete — building preview...")
            status_msg_id = m.message_id

        process_job_data(chat_id, job_data, status_msg_id)
        return

    # ── Groq AI extraction for plain text / URLs ──────────────────────────────
    msg = bot.send_message(chat_id, "🤖 Extracting job details with Groq AI...")

    def update_status(text):
        try:
            bot.edit_message_text(text, chat_id, msg.message_id)
        except Exception:
            pass

    try:
        job_data = extract_job_data(job_text, status_callback=update_status)
    except json.JSONDecodeError:
        bot.edit_message_text("❌ AI returned invalid data. Please try again with more details.",
                               chat_id, msg.message_id)
        return
    except Exception as e:
        bot.edit_message_text(f"❌ Extraction failed: {str(e)[:200]}", chat_id, msg.message_id)
        return

    process_job_data(chat_id, job_data, msg.message_id)


@bot.callback_query_handler(func=lambda call: True)
def handle_button(call):
    chat_id = call.message.chat.id

    if call.data == "confirm_post":
        job_data = pending_jobs.get(chat_id)
        if not job_data:
            bot.answer_callback_query(call.id, "Session expired — please send the job again")
            bot.edit_message_text("❌ Session expired. Please paste the job description again.",
                                   chat_id, call.message.message_id)
            return

        bot.answer_callback_query(call.id, "Posting...")
        bot.edit_message_text("🔐 Authenticating...", chat_id, call.message.message_id)

        try:
            token = get_auth_token()
            bot.edit_message_text("📤 Posting job to JobFresh...", chat_id, call.message.message_id)
            result = post_job(job_data, token)
            job_id = result["data"]["id"]
            slug   = make_slug(job_data.get("title", ""), job_data.get("company", ""), job_data.get("type", ""), job_id)
            url    = f"https://jobfresh.in/jobs/{slug}"

            bot.edit_message_text(
                f"✅ <b>Job posted successfully!</b>\n\n"
                f"<b>ID:</b> {job_id}\n"
                f"<b>URL:</b> {url}",
                chat_id,
                call.message.message_id,
                parse_mode="HTML"
            )
        except Exception as e:
            bot.edit_message_text(f"❌ Failed to post: {str(e)[:300]}", chat_id, call.message.message_id)

        pending_jobs.pop(chat_id, None)

    elif call.data == "cancel":
        pending_jobs.pop(chat_id, None)
        bot.answer_callback_query(call.id, "Cancelled")
        bot.edit_message_text("❌ Cancelled.", chat_id, call.message.message_id)


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    missing = [k for k in ("TELEGRAM_BOT_TOKEN", "GROQ_API_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD")
               if not os.environ.get(k)]
    if missing:
        raise SystemExit(f"Missing env vars: {', '.join(missing)}")

    bot.remove_webhook()
    print(f"🤖 JobFresh Telegram Bot running...")
    print(f"   API: {JOBFRESH_API_URL}")
    bot.infinity_polling(timeout=30, long_polling_timeout=20, allowed_updates=["message", "callback_query"])
