#!/usr/bin/env python3
"""Generate App Store screenshots that closely match the shipped NetworkLoop UI.

Outputs:
- iPhone 6.5": 1242 x 2688
- iPad 12.9": 2048 x 2732

The artwork is drawn in native logical points and exported to Apple's required
pixel sizes with macOS `sips`.
"""

from __future__ import annotations

from pathlib import Path
import html
import subprocess

PX_W = 1242
PX_H = 2688
W = 414
H = 896
OUT = Path("app-store/screenshots/iphone-6-5")

IPAD_PX_W = 2048
IPAD_PX_H = 2732
IPAD_W = 1024
IPAD_H = 1366
IPAD_OUT = Path("app-store/screenshots/ipad-12-9")

COLORS = {
    "background": "#F2F2F5",
    "surface": "#FFFFFF",
    "surfaceMuted": "#E6E7EB",
    "text": "#101114",
    "textMuted": "#6C707A",
    "textSubtle": "#8A8F99",
    "primary": "#0B6BFF",
    "primaryDark": "#0B4FBF",
    "primarySoft": "#E8F0FF",
    "border": "rgba(0,0,0,0.07)",
    "divider": "rgba(0,0,0,0.055)",
    "danger": "#B3261E",
    "dangerSoft": "#FCEBE9",
    "warning": "#C0562E",
    "warningSoft": "#FFF3DF",
    "success": "#166E4F",
    "successSoft": "#E4F5EC",
    "note": "#FFF9EC",
    "noteBorder": "rgba(190,140,20,0.18)",
    "white": "#FFFFFF",
}

AVATAR = ["#3A6FD8", "#5B5F9E", "#2E7D74", "#8A5A4E", "#6E5B9E", "#3F7A5A"]


def e(value: str) -> str:
    return html.escape(value, quote=True)


def t(
    x: float,
    y: float,
    value: str,
    size: float = 14,
    weight: int = 500,
    fill: str = COLORS["text"],
    anchor: str = "start",
    family: str = "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    spacing: float | None = None,
) -> str:
    ls = "" if spacing is None else f' letter-spacing="{spacing}"'
    return (
        f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}" font-family="{family}"{ls}>{e(value)}</text>'
    )


def wrapped(x: float, y: float, value: str, size: float, width_chars: int, fill=COLORS["textMuted"], weight=500, line=1.35) -> str:
    import textwrap

    out = []
    for index, row in enumerate(textwrap.wrap(value, width_chars)):
        out.append(t(x, y + index * size * line, row, size=size, weight=weight, fill=fill))
    return "".join(out)


def rect(x, y, w, h, r=0, fill=COLORS["surface"], stroke=None, sw=1) -> str:
    stroke_attr = "" if stroke is None else f' stroke="{stroke}" stroke-width="{sw}"'
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{stroke_attr}/>'


def circle(cx, cy, r, fill) -> str:
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'


def line(x1, y1, x2, y2, stroke="#D9DCE2", sw=1) -> str:
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"/>'


def status_badge(x, y, label, tone="primary") -> str:
    tones = {
        "primary": (COLORS["primarySoft"], COLORS["primaryDark"]),
        "success": (COLORS["successSoft"], COLORS["success"]),
        "warning": (COLORS["warningSoft"], COLORS["warning"]),
        "danger": (COLORS["dangerSoft"], COLORS["danger"]),
        "muted": (COLORS["surfaceMuted"], COLORS["textMuted"]),
    }
    bg, fg = tones[tone]
    width = max(76, len(label) * 6.5 + 18)
    return rect(x, y, width, 23, 7, bg) + t(x + 9, y + 15.5, label, 11, 700, fg)


def due_badge(x, y, label, tone="muted") -> str:
    bg = COLORS["primarySoft"] if tone == "primary" else COLORS["warningSoft"] if tone == "warning" else COLORS["dangerSoft"] if tone == "danger" else COLORS["surfaceMuted"]
    fg = COLORS["primaryDark"] if tone == "primary" else COLORS["warning"] if tone == "warning" else COLORS["danger"] if tone == "danger" else COLORS["textMuted"]
    width = max(56, len(label) * 6.4 + 15)
    return rect(x, y, width, 22, 6, bg) + t(x + width / 2, y + 15, label, 11, 700, fg, anchor="middle")


def avatar(x, y, initials, color_i=0, size=38) -> str:
    return rect(x, y, size, size, size / 2, AVATAR[color_i % len(AVATAR)]) + t(x + size / 2, y + size / 2 + 5, initials, 13 if size <= 40 else 21, 700, COLORS["white"], anchor="middle")


def ios_status_bar() -> str:
    return (
        t(23, 28, "9:41", 15, 700)
        + rect(334, 18, 22, 12, 6, "none", COLORS["text"], 1.4)
        + rect(358, 21, 2, 6, 1, COLORS["text"])
        + rect(337, 21, 16, 6, 3, COLORS["text"])
        + t(286, 29, "◔", 16, 700)
        + t(307, 29, "⌁", 16, 700)
    )


def nav_header(title: str, right: str | None = None, back: str | None = None) -> str:
    left = t(18, 73, "‹", 30, 400, COLORS["text"]) + (t(40, 70, back, 15, 600, COLORS["textMuted"]) if back else "")
    return (
        left
        + t(W / 2, 72, title, 17, 700, COLORS["text"], anchor="middle")
        + (t(382, 72, right, 16, 800, COLORS["primary"], anchor="end") if right else "")
        + line(0, 92, W, 92, "#E2E3E7", 1)
    )


def tab_bar(active: str) -> str:
    labels = [("Today", "◷"), ("Contacts", "☷"), ("", "+"), ("Firms", "▥"), ("Settings", "⚙")]
    xs = [43, 124, 207, 290, 371]
    out = rect(0, 812, W, 84, 0, "rgba(248,248,250,0.94)", "#E1E2E7")
    for x, (label, icon) in zip(xs, labels):
        if icon == "+":
            out += rect(x - 23, 818, 46, 46, 23, COLORS["primary"])
            out += t(x, 850, "+", 29, 300, COLORS["white"], anchor="middle")
            continue
        color = COLORS["primary"] if label == active else COLORS["textSubtle"]
        out += t(x, 840, icon, 22, 700, color, anchor="middle")
        out += t(x, 864, label, 10.5, 700, color, anchor="middle")
    return out


def shell(content: str, tab: str | None = None, nav: str = "") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{PX_W}" height="{PX_H}" viewBox="0 0 {W} {H}">
      <rect width="{W}" height="{H}" fill="{COLORS['background']}"/>
      {ios_status_bar()}
      {nav}
      {content}
      {tab_bar(tab) if tab else ""}
    </svg>"""


def contact_card(x, y, name, subtitle, status, due=None, color_i=0, compact=False, notes=None, status_tone="primary", due_tone="muted") -> str:
    h = 73 if compact else 112
    out = rect(x, y, 378, h, 0 if compact else 16, COLORS["surface"], COLORS["border"])
    out += avatar(x + 14, y + 17, "".join(p[0] for p in name.split()[:2]), color_i)
    out += t(x + 64, y + 36, name, 15.5, 700)
    out += t(x + 64, y + 56, subtitle, 12.5, 500, COLORS["textMuted"])
    out += status_badge(x + 250, y + 16, status, status_tone)
    if due:
        out += due_badge(x + 301, y + 47, due, due_tone)
    if notes:
        out += wrapped(x + 64, y + 86, notes, 12.5, 40, COLORS["textSubtle"], 500, 1.25)
    if compact:
        out += line(x, y + h - 1, x + 378, y + h - 1, "#EEEEF1", 1)
    return out


def dashboard() -> str:
    content = (
        t(18, 67, "TUESDAY, JUL 28", 12, 700, COLORS["textSubtle"], spacing=1)
        + t(18, 100, "Today", 32, 800)
        + t(394, 94, "networkloop", 13, 500, COLORS["textMuted"], anchor="end")
    )
    mx = 18
    for i, (value, label, alert) in enumerate([("7", "contacts", False), ("5", "firms", False), ("3", "to follow up", True)]):
        x = mx + i * 126
        bg = COLORS["primary"] if alert else COLORS["surface"]
        content += rect(x, 122, 118, 76, 14, bg, COLORS["border"])
        content += t(x + 12, 154, value, 24, 700, COLORS["white"] if alert else COLORS["text"], family="Menlo")
        content += t(x + 12, 176, label, 11, 500, "rgba(255,255,255,0.82)" if alert else COLORS["textSubtle"])

    content += t(22, 228, "FOLLOW UP NOW", 12, 800, COLORS["textSubtle"], spacing=.8)
    content += t(392, 228, "Add contact", 12, 700, COLORS["primary"], anchor="end")
    content += rect(18, 244, 378, 126, 16, COLORS["surface"], COLORS["border"])
    content += contact_card(18, 244, "Maya Chen", "Product Manager · Stripe", "Strong connection", None, 0, compact=False, status_tone="success")
    content += rect(32, 322, 214, 34, 11, COLORS["primary"])
    content += t(139, 344, "Log a chat", 14, 700, COLORS["white"], anchor="middle")
    content += rect(254, 322, 112, 34, 11, COLORS["surface"], "rgba(0,0,0,0.1)")
    content += t(310, 344, "Due today", 13, 700, COLORS["textMuted"], anchor="middle")

    content += rect(18, 382, 378, 126, 16, COLORS["surface"], COLORS["border"])
    content += contact_card(18, 382, "Jordan Lee", "Recruiter · Deloitte", "Call scheduled", None, 1, compact=False, status_tone="primary")
    content += rect(32, 460, 214, 34, 11, COLORS["primary"])
    content += t(139, 482, "Log a chat", 14, 700, COLORS["white"], anchor="middle")
    content += rect(254, 460, 112, 34, 11, COLORS["surface"], "rgba(0,0,0,0.1)")
    content += t(310, 482, "Tomorrow", 13, 700, COLORS["textMuted"], anchor="middle")

    content += t(22, 548, "GOING COLD", 12, 800, COLORS["textSubtle"], spacing=.8)
    content += rect(18, 565, 378, 94, 16, COLORS["surface"], COLORS["border"])
    content += t(32, 594, "Priya Shah", 15, 700)
    content += t(32, 614, "Analyst · Bain", 12.5, 500, COLORS["textSubtle"])
    content += t(382, 607, "Jul 10", 12, 700, COLORS["warning"], anchor="end", family="Menlo")
    content += line(32, 636, 382, 636, "#EEEEF1")
    content += t(32, 651, "Alex Morgan", 15, 700)
    content += t(382, 651, "Jul 8", 12, 700, COLORS["warning"], anchor="end", family="Menlo")

    content += t(22, 695, "LOGGED THIS WEEK", 12, 800, COLORS["textSubtle"], spacing=.8)
    content += circle(25, 720, 3.5, "#C4C8D0") + t(42, 724, "Maya Chen · Networking call", 13.5, 500)
    content += t(42, 744, "Talked about team culture and interview prep.", 12.5, 500, COLORS["textSubtle"])
    content += t(382, 724, "Jul 28", 11.5, 600, "#A6ABB4", anchor="end", family="Menlo")
    return shell(content, "Today")


def contacts() -> str:
    content = (
        t(18, 89, "Contacts", 32, 800)
        + rect(352, 55, 44, 44, 22, COLORS["primary"])
        + t(374, 85, "+", 25, 300, COLORS["white"], anchor="middle")
        + rect(18, 113, 378, 42, 12, COLORS["surfaceMuted"])
        + t(34, 140, "⌕", 18, 500, COLORS["textSubtle"])
        + t(58, 140, "Name, firm, or group", 15.5, 500, COLORS["textSubtle"])
    )
    x = 18
    for label, selected in [("All", True), ("Due", False), ("Warm", False), ("Stale", False), ("Spoke with them", False)]:
        w = max(48, len(label) * 7 + 26)
        content += rect(x, 168, w, 32, 20, COLORS["primary"] if selected else COLORS["surface"])
        content += t(x + w / 2, 188.5, label, 13, 700, COLORS["white"] if selected else COLORS["textMuted"], anchor="middle")
        x += w + 7
    content += t(22, 228, "7 of 7 shown", 12, 500, COLORS["textSubtle"])
    content += rect(18, 244, 378, 486, 16, COLORS["surface"], COLORS["border"])
    rows = [
        ("Maya Chen", "Product Manager · Stripe", "Strong connection", "Due today", 0, "success", "primary"),
        ("Jordan Lee", "Recruiter · Deloitte", "Call scheduled", "Tomorrow", 1, "primary", "muted"),
        ("Priya Shah", "Analyst · Bain", "Follow-up needed", "2d late", 2, "warning", "danger"),
        ("Alex Morgan", "University Recruiter · LinkedIn", "Responded", None, 3, "primary", "muted"),
        ("Sam Rivera", "UX Designer · Google", "Reached out", None, 4, "muted", "muted"),
        ("Daniel Brooks", "Campus Recruiter · Goldman Sachs", "Spoke with them", "in 5d", 5, "primary", "muted"),
    ]
    for i, (name, subtitle, status, due, color_i, status_tone, due_tone) in enumerate(rows):
        content += contact_card(
            18,
            244 + i * 73,
            name,
            subtitle,
            status,
            due,
            color_i,
            compact=True,
            status_tone=status_tone,
            due_tone=due_tone,
        )
    return shell(content, "Contacts")


def detail() -> str:
    content = nav_header("Maya Chen", "Edit", "Contacts")
    content += avatar(18, 113, "MC", 0, size=64)
    content += t(96, 138, "Maya Chen", 22, 800)
    content += t(96, 158, "Product Manager · Stripe", 13.5, 500, COLORS["textMuted"])
    content += status_badge(96, 168, "Strong connection", "success")
    for i, (label, primary) in enumerate([("Log", True), ("Email", False), ("LinkedIn", False)]):
        x = 18 + i * 132
        content += rect(x, 218, 122, 48, 12, COLORS["primary"] if primary else COLORS["surface"], COLORS["primary"] if primary else COLORS["border"])
        content += t(x + 61, 248, label, 14.5, 700, COLORS["white"] if primary else COLORS["textMuted"], anchor="middle")
    content += rect(18, 284, 378, 312, 16, COLORS["surface"], COLORS["border"])
    facts = [
        ("Stage", "Strong connection", False),
        ("Next follow-up", "Due today", True),
        ("Company", "Stripe", False),
        ("Role", "Product Manager", False),
        ("Industry", "Technology", False),
        ("Email", "maya@example.com", False),
        ("LinkedIn", "linkedin.com/in/mayachen", False),
    ]
    for i, (label, value, danger) in enumerate(facts):
        y = 314 + i * 40
        content += t(32, y, label, 13.5, 500, COLORS["textSubtle"])
        content += t(382, y, value, 13.5, 600, COLORS["danger"] if danger else COLORS["text"], anchor="end")
        if i < len(facts) - 1:
            content += line(32, y + 17, 382, y + 17, "#EEEEF1")
    content += t(22, 635, "CONVERSATIONS", 12, 800, COLORS["textSubtle"], spacing=.8)
    content += t(22, 657, "3 entries", 13, 500, COLORS["textMuted"])
    content += rect(358, 628, 38, 38, 12, COLORS["primarySoft"])
    content += t(377, 653, "+", 22, 400, COLORS["primary"], anchor="middle")
    content += circle(24, 692, 5, COLORS["primary"]) + line(24, 697, 24, 773, "#D9DCE2", 2)
    content += t(44, 696, "Networking call", 14, 700)
    content += t(382, 696, "Jul 28", 11.5, 600, "#A6ABB4", anchor="end", family="Menlo")
    content += wrapped(44, 717, "Discussed product strategy, team culture, and early-career paths.", 13.5, 45, "#4C525C")
    content += t(44, 760, "Next: send thank-you note", 13, 600, COLORS["primaryDark"])
    content += circle(24, 785, 5, COLORS["primary"])
    content += t(44, 789, "Recruiter email", 14, 700)
    content += t(382, 789, "Jul 19", 11.5, 600, "#A6ABB4", anchor="end", family="Menlo")
    content += wrapped(44, 810, "Shared resume and asked about intern hiring timelines.", 13.5, 45, "#4C525C")
    return shell(content, None, "")


def conversation() -> str:
    content = rect(0, 66, W, 900, 34, "#F7F7FA")
    content += t(W / 2, 111, "Add conversation", 17, 800, anchor="middle")
    content += rect(350, 82, 40, 40, 20, COLORS["surface"])
    content += t(370, 108, "☵", 17, 700, COLORS["primary"], anchor="middle")
    content += rect(188, 156, 38, 5, 3, "rgba(0,0,0,0.16)")
    content += t(18, 195, "Cancel", 15.5, 600, COLORS["textSubtle"])
    content += t(207, 195, "Log an interaction", 16.5, 800, anchor="middle")
    content += t(396, 195, "Save", 15.5, 600, COLORS["textSubtle"], anchor="end")
    fields = [
        ("Date", "2026-07-28", "Use YYYY-MM-DD", 50),
        ("Type", None, None, 88),
        ("What came out of it *", "Talked about the PM recruiting process, team culture, and what to prepare before applying.", None, 118),
        ("Next step", "Send a thank-you note and follow up next week.", None, 112),
    ]
    y = 234
    for label, value, hint, height in fields:
        content += t(20, y, label, 13, 700)
        if label == "Type":
            chips = ["Networking call", "Interview", "Coffee chat"]
            x = 20
            for i, chip in enumerate(chips):
                w = len(chip) * 6.2 + 26
                content += rect(x, y + 14, w, 36, 18, COLORS["primary"] if i == 0 else COLORS["surface"], COLORS["primary"] if i == 0 else "rgba(0,0,0,0.12)")
                content += t(x + w / 2, y + 37, chip, 13, 600, COLORS["white"] if i == 0 else COLORS["textMuted"], anchor="middle")
                x += w + 7
        else:
            content += rect(20, y + 14, 374, height, 13, COLORS["surface"], COLORS["border"])
            if value:
                content += wrapped(34, y + 45, value, 15.5, 38 if height > 70 else 80, COLORS["text"], 500, 1.3)
            if hint:
                content += t(20, y + 82, hint, 12, 500, COLORS["textSubtle"])
        y += height + (49 if label == "Date" else 36)
    content += rect(20, 748, 374, 50, 14, COLORS["primary"])
    content += t(207, 779, "Save conversation", 15, 700, COLORS["white"], anchor="middle")
    return shell(content)


def add_contact() -> str:
    content = rect(0, 66, W, 900, 34, "#F7F7FA")
    content += t(W / 2, 111, "New contact", 17, 800, anchor="middle")
    fields = [
        ("Name *", "Jordan Lee"),
        ("Company", "Deloitte"),
        ("Role", "Campus Recruiter"),
        ("Email", "jordan@example.com"),
        ("LinkedIn URL", "https://linkedin.com/in/jordanlee"),
        ("Industry", "Consulting"),
    ]
    y = 162
    for label, value in fields:
        content += t(20, y, label, 13, 700)
        content += rect(20, y + 14, 374, 50, 13, COLORS["surface"], COLORS["border"])
        content += t(34, y + 46, value, 15.5, 500)
        y += 78
    content += t(20, y, "Status", 13, 700)
    for i, chip in enumerate(["Reached out", "Responded", "Call scheduled"]):
        x = 20 + i * 124
        w = 112 if i == 0 else 103 if i == 1 else 125
        content += rect(x, y + 14, w, 36, 18, COLORS["primary"] if i == 0 else COLORS["surface"], COLORS["primary"] if i == 0 else "rgba(0,0,0,0.12)")
        content += t(x + w / 2, y + 37, chip, 13, 600, COLORS["white"] if i == 0 else COLORS["textMuted"], anchor="middle")
    y += 74
    content += t(20, y, "Next follow-up date", 13, 700)
    content += rect(20, y + 14, 374, 50, 13, COLORS["surface"], COLORS["border"])
    content += t(34, y + 46, "2026-08-05", 15.5, 500)
    content += t(20, y + 82, "Use YYYY-MM-DD. Leave blank if no follow-up is scheduled.", 12, 500, COLORS["textSubtle"])
    return shell(content)


def ipad_status_bar() -> str:
    return (
        t(38, 36, "9:41", 18, 700)
        + t(838, 36, "Wi‑Fi", 15, 700)
        + rect(928, 21, 44, 18, 9, "none", COLORS["text"], 1.6)
        + rect(976, 26, 4, 8, 2, COLORS["text"])
        + rect(932, 25, 34, 10, 5, COLORS["text"])
    )


def ipad_tab_bar(active: str) -> str:
    labels = [("Today", "◷"), ("Contacts", "☷"), ("", "+"), ("Firms", "▥"), ("Settings", "⚙")]
    xs = [132, 322, 512, 702, 892]
    out = rect(0, 1254, IPAD_W, 112, 0, "rgba(248,248,250,0.96)", "#E1E2E7")
    for x, (label, icon) in zip(xs, labels):
        if icon == "+":
            out += rect(x - 36, 1269, 72, 72, 36, COLORS["primary"])
            out += t(x, 1316, "+", 43, 300, COLORS["white"], anchor="middle")
            continue
        color = COLORS["primary"] if label == active else COLORS["textSubtle"]
        out += t(x, 1300, icon, 31, 700, color, anchor="middle")
        out += t(x, 1332, label, 15, 700, color, anchor="middle")
    return out


def ipad_shell(content: str, tab: str | None = None, nav: str = "") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{IPAD_PX_W}" height="{IPAD_PX_H}" viewBox="0 0 {IPAD_W} {IPAD_H}">
      <rect width="{IPAD_W}" height="{IPAD_H}" fill="{COLORS['background']}"/>
      {ipad_status_bar()}
      {nav}
      {content}
      {ipad_tab_bar(tab) if tab else ""}
    </svg>"""


def ipad_metric(x: float, y: float, w: float, value: str, label: str, selected=False) -> str:
    bg = COLORS["primary"] if selected else COLORS["surface"]
    fg = COLORS["white"] if selected else COLORS["text"]
    muted = "rgba(255,255,255,0.82)" if selected else COLORS["textSubtle"]
    return rect(x, y, w, 120, 22, bg, COLORS["border"]) + t(x + 28, y + 56, value, 34, 750, fg, family="Menlo") + t(x + 28, y + 90, label, 16, 600, muted)


def ipad_dashboard() -> str:
    content = (
        t(54, 112, "TUESDAY, JUL 28", 17, 800, COLORS["textSubtle"], spacing=1.2)
        + t(54, 168, "Today", 52, 850)
        + t(970, 160, "NetworkLoop", 20, 500, COLORS["textMuted"], anchor="end")
        + ipad_metric(54, 214, 270, "7", "contacts")
        + ipad_metric(346, 214, 270, "5", "firms")
        + ipad_metric(638, 214, 332, "3", "to follow up", selected=True)
        + t(64, 392, "FOLLOW UP NOW", 17, 850, COLORS["textSubtle"], spacing=1.1)
        + t(970, 392, "Add contact", 17, 800, COLORS["primary"], anchor="end")
    )
    cards = [
        ("Maya Chen", "Product Manager · Stripe", "Strong connection", "Due today", 0, "success", "primary"),
        ("Jordan Lee", "Recruiter · Deloitte", "Call scheduled", "Tomorrow", 1, "primary", "muted"),
        ("Priya Shah", "Analyst · Bain", "Follow-up needed", "2d late", 2, "warning", "danger"),
    ]
    for i, (name, subtitle, status, due, color_i, status_tone, due_tone) in enumerate(cards):
        y = 430 + i * 148
        content += rect(54, y, 556, 122, 22, COLORS["surface"], COLORS["border"])
        content += avatar(82, y + 28, "".join(p[0] for p in name.split()[:2]), color_i, 54)
        content += t(154, y + 56, name, 22, 800)
        content += t(154, y + 83, subtitle, 17, 500, COLORS["textMuted"])
        content += status_badge(412, y + 28, status, status_tone)
        content += due_badge(496, y + 68, due, due_tone)
    content += t(664, 392, "LOGGED THIS WEEK", 17, 850, COLORS["textSubtle"], spacing=1.1)
    content += rect(638, 430, 332, 245, 22, COLORS["surface"], COLORS["border"])
    content += circle(670, 478, 5, "#C4C8D0") + t(694, 484, "Maya Chen · Call", 18, 700)
    content += wrapped(694, 512, "Talked about team culture and interview prep.", 16, 30, COLORS["textSubtle"])
    content += t(946, 484, "Jul 28", 15, 700, "#A6ABB4", anchor="end", family="Menlo")
    content += circle(670, 590, 5, "#C4C8D0") + t(694, 596, "Jordan Lee · Email", 18, 700)
    content += wrapped(694, 624, "Shared resume and confirmed next call.", 16, 30, COLORS["textSubtle"])
    content += t(946, 596, "Jul 27", 15, 700, "#A6ABB4", anchor="end", family="Menlo")
    content += t(664, 728, "GOING COLD", 17, 850, COLORS["textSubtle"], spacing=1.1)
    content += rect(638, 766, 332, 202, 22, COLORS["surface"], COLORS["border"])
    content += t(670, 820, "Alex Morgan", 20, 750)
    content += t(670, 850, "University Recruiter · LinkedIn", 15, 500, COLORS["textSubtle"])
    content += t(946, 832, "Jul 10", 15, 700, COLORS["warning"], anchor="end", family="Menlo")
    content += line(670, 886, 946, 886, "#EEEEF1")
    content += t(670, 936, "Sam Rivera", 20, 750)
    content += t(946, 936, "Jul 8", 15, 700, COLORS["warning"], anchor="end", family="Menlo")
    return ipad_shell(content, "Today")


def ipad_contacts() -> str:
    content = (
        t(54, 142, "Contacts", 52, 850)
        + rect(904, 91, 66, 66, 33, COLORS["primary"])
        + t(937, 136, "+", 39, 300, COLORS["white"], anchor="middle")
        + rect(54, 194, 916, 64, 18, COLORS["surfaceMuted"])
        + t(82, 235, "⌕", 24, 500, COLORS["textSubtle"])
        + t(120, 235, "Name, firm, or group", 22, 500, COLORS["textSubtle"])
    )
    x = 54
    for label, selected in [("All", True), ("Due", False), ("Warm", False), ("Stale", False), ("Spoke with them", False), ("Call scheduled", False)]:
        w = max(72, len(label) * 10 + 36)
        content += rect(x, 286, w, 46, 23, COLORS["primary"] if selected else COLORS["surface"])
        content += t(x + w / 2, 315, label, 18, 750, COLORS["white"] if selected else COLORS["textMuted"], anchor="middle")
        x += w + 12
    content += t(62, 372, "7 of 7 shown", 17, 500, COLORS["textSubtle"])
    content += rect(54, 408, 916, 588, 24, COLORS["surface"], COLORS["border"])
    rows = [
        ("Maya Chen", "Product Manager · Stripe", "Strong connection", "Due today", 0, "success", "primary"),
        ("Jordan Lee", "Recruiter · Deloitte", "Call scheduled", "Tomorrow", 1, "primary", "muted"),
        ("Priya Shah", "Analyst · Bain", "Follow-up needed", "2d late", 2, "warning", "danger"),
        ("Alex Morgan", "University Recruiter · LinkedIn", "Responded", "in 4d", 3, "primary", "muted"),
        ("Sam Rivera", "UX Designer · Google", "Reached out", None, 4, "muted", "muted"),
    ]
    for i, (name, subtitle, status, due, color_i, status_tone, due_tone) in enumerate(rows):
        y = 408 + i * 112
        content += avatar(82, y + 30, "".join(p[0] for p in name.split()[:2]), color_i, 54)
        content += t(154, y + 58, name, 22, 800)
        content += t(154, y + 86, subtitle, 17, 500, COLORS["textMuted"])
        content += status_badge(722, y + 30, status, status_tone)
        if due:
            content += due_badge(850, y + 68, due, due_tone)
        if i < len(rows) - 1:
            content += line(54, y + 111, 970, y + 111, "#EEEEF1")
    return ipad_shell(content, "Contacts")


def ipad_detail() -> str:
    nav = t(54, 92, "‹ Contacts", 20, 700, COLORS["primary"]) + t(512, 92, "Maya Chen", 22, 800, anchor="middle") + t(970, 92, "Edit", 20, 800, COLORS["primary"], anchor="end") + line(0, 116, IPAD_W, 116, "#E2E3E7")
    content = avatar(54, 170, "MC", 0, 92)
    content += t(170, 214, "Maya Chen", 34, 850)
    content += t(170, 252, "Product Manager · Stripe", 20, 500, COLORS["textMuted"])
    content += status_badge(170, 274, "Strong connection", "success")
    for i, label in enumerate(["Log", "Email", "LinkedIn"]):
        x = 54 + i * 164
        content += rect(x, 356, 148, 58, 16, COLORS["primary"] if i == 0 else COLORS["surface"], COLORS["primary"] if i == 0 else COLORS["border"])
        content += t(x + 74, 392, label, 18, 750, COLORS["white"] if i == 0 else COLORS["textMuted"], anchor="middle")
    content += rect(54, 460, 440, 448, 24, COLORS["surface"], COLORS["border"])
    content += t(84, 512, "CONTACT INFO", 16, 850, COLORS["textSubtle"], spacing=1)
    facts = [("Stage", "Strong connection"), ("Next follow-up", "Due today"), ("Company", "Stripe"), ("Role", "Product Manager"), ("Industry", "Technology"), ("Email", "maya@example.com")]
    for i, (label, value) in enumerate(facts):
        y = 566 + i * 54
        content += t(84, y, label, 18, 500, COLORS["textSubtle"])
        content += t(462, y, value, 18, 650, COLORS["danger"] if label == "Next follow-up" else COLORS["text"], anchor="end")
        if i < len(facts) - 1:
            content += line(84, y + 23, 462, y + 23, "#EEEEF1")
    content += t(548, 512, "CONVERSATIONS", 16, 850, COLORS["textSubtle"], spacing=1)
    content += rect(548, 546, 422, 362, 24, COLORS["surface"], COLORS["border"])
    content += circle(586, 604, 7, COLORS["primary"]) + line(586, 612, 586, 790, "#D9DCE2", 2)
    content += t(614, 610, "Networking call", 20, 750)
    content += t(942, 610, "Jul 28", 15, 700, "#A6ABB4", anchor="end", family="Menlo")
    content += wrapped(614, 642, "Discussed product strategy, team culture, and early-career paths.", 17, 37, "#4C525C")
    content += t(614, 710, "Next: send thank-you note", 17, 700, COLORS["primaryDark"])
    content += circle(586, 806, 7, COLORS["primary"])
    content += t(614, 812, "Recruiter email", 20, 750)
    content += wrapped(614, 844, "Shared resume and asked about intern hiring timelines.", 17, 37, "#4C525C")
    return ipad_shell(content, None, nav)


def ipad_conversation() -> str:
    content = rect(122, 82, 780, 1130, 40, "#F7F7FA")
    content += t(512, 146, "Add conversation", 24, 800, anchor="middle")
    content += rect(474, 206, 76, 8, 4, "rgba(0,0,0,0.16)")
    content += t(170, 270, "Cancel", 21, 650, COLORS["textSubtle"])
    content += t(512, 270, "Log an interaction", 25, 850, anchor="middle")
    content += t(854, 270, "Save", 21, 650, COLORS["primary"], anchor="end")
    y = 330
    content += t(170, y, "Date", 19, 800)
    content += rect(170, y + 24, 684, 72, 18, COLORS["surface"], COLORS["border"]) + t(200, y + 70, "2026-07-28", 25, 500)
    content += t(170, y + 126, "Use YYYY-MM-DD", 16, 500, COLORS["textSubtle"])
    y += 198
    content += t(170, y, "Type", 19, 800)
    x = 170
    for i, label in enumerate(["Networking call", "Interview", "Coffee chat", "Recruiter email"]):
        w = len(label) * 10 + 42
        content += rect(x, y + 24, w, 52, 26, COLORS["primary"] if i == 0 else COLORS["surface"], COLORS["primary"] if i == 0 else "rgba(0,0,0,0.12)")
        content += t(x + w / 2, y + 57, label, 19, 700, COLORS["white"] if i == 0 else COLORS["textMuted"], anchor="middle")
        x += w + 14
    y += 140
    for label, placeholder, height in [
        ("What came out of it *", "What did you discuss? What stood out? What should future-you remember?", 190),
        ("Next step", "Send a thank-you note, apply for the role, reconnect next month...", 170),
    ]:
        content += t(170, y, label, 19, 800)
        content += rect(170, y + 24, 684, height, 20, COLORS["surface"], COLORS["border"])
        content += wrapped(204, y + 72, placeholder, 24, 52, COLORS["textSubtle"])
        y += height + 76
    content += rect(170, 1100, 684, 72, 20, COLORS["primary"])
    content += t(512, 1145, "Save conversation", 22, 800, COLORS["white"], anchor="middle")
    return ipad_shell(content)


def ipad_add_contact() -> str:
    content = rect(122, 82, 780, 1130, 40, "#F7F7FA")
    content += t(512, 146, "New contact", 24, 800, anchor="middle")
    fields = [("Name *", "Jordan Lee"), ("Company", "Deloitte"), ("Role", "Campus Recruiter"), ("Email", "jordan@example.com"), ("LinkedIn URL", "https://linkedin.com/in/jordanlee"), ("Industry", "Consulting")]
    for i, (label, value) in enumerate(fields):
        col = i % 2
        row = i // 2
        x = 170 + col * 356
        y = 218 + row * 128
        content += t(x, y, label, 19, 800)
        content += rect(x, y + 24, 328, 68, 18, COLORS["surface"], COLORS["border"])
        content += t(x + 26, y + 68, value, 22, 500, COLORS["text"] if "example" not in value and "http" not in value else COLORS["textMuted"])
    y = 626
    content += t(170, y, "Status", 19, 800)
    x = 170
    for i, label in enumerate(["Reached out", "Responded", "Call scheduled", "Spoke with them"]):
        w = len(label) * 10 + 44
        content += rect(x, y + 26, w, 52, 26, COLORS["primary"] if i == 2 else COLORS["surface"], COLORS["primary"] if i == 2 else "rgba(0,0,0,0.12)")
        content += t(x + w / 2, y + 59, label, 19, 700, COLORS["white"] if i == 2 else COLORS["textMuted"], anchor="middle")
        x += w + 14
    y = 760
    content += t(170, y, "Next follow-up date", 19, 800)
    content += rect(170, y + 24, 684, 72, 18, COLORS["surface"], COLORS["border"]) + t(200, y + 70, "2026-08-05", 24, 500)
    content += t(170, y + 126, "Use YYYY-MM-DD. Leave blank if no follow-up is scheduled.", 16, 500, COLORS["textSubtle"])
    y = 930
    content += t(170, y, "General notes", 19, 800)
    content += rect(170, y + 24, 684, 108, 20, COLORS["surface"], COLORS["border"])
    content += t(204, y + 72, "Met at the campus recruiting event.", 22, 500)
    content += rect(170, 1100, 684, 72, 20, COLORS["primary"])
    content += t(512, 1145, "Save contact", 22, 800, COLORS["white"], anchor="middle")
    return ipad_shell(content)


SCREENS = [
    ("01-dashboard.svg", dashboard()),
    ("02-contacts.svg", contacts()),
    ("03-contact-detail.svg", detail()),
    ("04-add-conversation.svg", conversation()),
    ("05-add-contact.svg", add_contact()),
]

IPAD_SCREENS = [
    ("01-dashboard.svg", ipad_dashboard()),
    ("02-contacts.svg", ipad_contacts()),
    ("03-contact-detail.svg", ipad_detail()),
    ("04-add-conversation.svg", ipad_conversation()),
    ("05-add-contact.svg", ipad_add_contact()),
]


def render_screens(out_dir: Path, screens: list[tuple[str, str]]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, svg in screens:
        svg_path = out_dir / name
        png_path = out_dir / name.replace(".svg", ".png")
        svg_path.write_text(svg)
        subprocess.run(
            ["sips", "-s", "format", "png", str(svg_path), "--out", str(png_path)],
            check=True,
            stdout=subprocess.DEVNULL,
        )
        print(png_path)


def main() -> None:
    render_screens(OUT, SCREENS)
    render_screens(IPAD_OUT, IPAD_SCREENS)


if __name__ == "__main__":
    main()
