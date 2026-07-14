# 🎂 Interactive Birthday Wish Website

A zero-dependency, single-page birthday surprise built with vanilla HTML, CSS and JavaScript.

## The experience

0. **Home page** — visiting with no URL parameters shows a creator form: enter your name, their name, and a message, then begin the surprise or copy a shareable magic link.
1. **Gift box intro** — a bouncing gift box; tapping it pops the lid with confetti.
2. **Personalized greeting** — the birthday person's name in glowing script, with a typewriter message.
3. **Blow out the candles** — a layered cake with 5 flickering candles. Blow into the **microphone** to extinguish them (real blow detection via the Web Audio API), or tap the flames as a fallback.
4. **Celebration** — confetti rain, fireworks, floating balloons you can pop, flip-to-reveal wish cards, and a fully **synthesized "Happy Birthday" melody** (no audio files).

Throughout: gold dust trails your cursor, and shooting stars occasionally cross the night sky.

## Personalize it

Everything is driven by URL parameters — no code changes needed:

```
index.html?name=Priya&msg=Have%20the%20most%20amazing%20day!&from=Sai
```

- `name` — the birthday person's name (omitted from the greeting if not provided)
- `msg` — a custom greeting message (default provided)
- `from` — the sender's name, shown on the opening screen ("Sai sent you a surprise")

Or just use the home page form, which generates and copies the magic link for you. On the final celebration screen, a floating golden light leads viewers back to the home page to make their own.

## Run it

Microphone access requires a secure context, so serve over localhost rather than opening the file directly:

```bash
cd birthday-wish
python3 -m http.server 8000
# open http://localhost:8000?name=YourFriend
```

## Host it

It's fully static — drop the three files on GitHub Pages, Netlify, Vercel, or any static host and share the link.
