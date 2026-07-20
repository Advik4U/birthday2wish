# Interactive Birthday Wish Website

Zero-dependency birthday surprises built with vanilla HTML, CSS and JavaScript. Two templates share one home page.

## Templates

### Gift & Cake
1. Gift box intro with confetti  
2. Personalized greeting + typewriter message  
3. Blow out candles (microphone or tap)  
4. Cake-cutting ceremony  
5. Celebration with song, balloons, wish cards  

### Birthday Call (new)
1. Incoming call UI — “[Sender] is calling…” with ringtone  
2. Answer → their pasted video plays inside the phone call  
3. Decline still delivers the typed birthday note  
4. Hang up → Happy Birthday end card + guiding light home  

Supported video links: YouTube (primary), Google Drive preview, Dropbox / direct links (open fallback).

## Home page

Visit with no parameters to pick a template, fill names / message / video URL, then begin or copy a magic link.

Gift link example:

```
/?HappyBirthdaySurprise=Advik&from=Sai&msg=Have%20an%20amazing%20day
```

Call link example:

```
/call.html?HappyBirthdaySurprise=Advik&from=Sai&msg=Miss%20you&v=https://youtube.com/watch?v=...
```

Chat previews are personalized via a Netlify Edge Function (`netlify/edge-functions/og.js`).

## Run locally

```bash
cd birthday-wish
python3 -m http.server 8000
# open http://localhost:8000/
```

## Deploy

Static site + Netlify Edge Function for OG tags. Push to the connected GitHub repo and Netlify auto-deploys.
