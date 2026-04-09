"""Generate logo options for Groundhoge Day ($HOGE)."""
import os
from concurrent.futures import ThreadPoolExecutor
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

OUTPUT_DIR = "/Users/dougkvamme/projects/groundhogeday/design/logos"

LOGOS = [
    (
        "01_corporate_seal",
        "A vintage corporate seal logo for 'GROUNDHOGE DAY ECONOMIC AUTHORITY'. "
        "Circular emblem in the style of a serious federal reserve or central bank seal. "
        "Centered silhouette of a noble groundhog facing forward. "
        "Ornate laurel wreath border. Text 'GROUNDHOGE DAY' arcing across the top, "
        "'ECONOMIC AUTHORITY' across the bottom. Small '$HOGE' below the groundhog. "
        "Monochrome on dark navy background. Professional, institutional, deadpan serious. "
        "Style of a US Treasury seal. High contrast line art."
    ),
    (
        "02_financial_crest",
        "An elegant heraldic crest logo for a meme cryptocurrency called 'Groundhoge Day'. "
        "Shield-shaped crest with a groundhog wearing a tiny top hat in the center. "
        "Two crossed acacia wood canes behind the shield. Ribbon banner below reading '$HOGE'. "
        "Latin motto on a scroll: 'IN UMBRA VERITAS' (in shadow, truth). "
        "Gold foil effect on dark background. Victorian financial institution aesthetic. "
        "Clean, refined, absurdly serious."
    ),
    (
        "03_minimal_modern",
        "A minimal modern logo for 'GROUNDHOGE DAY' cryptocurrency. "
        "Abstract geometric groundhog silhouette emerging from a burrow hole. "
        "Simple two-color design: amber (#ffaa00) on dark navy (#0a0a0f). "
        "Clean sans-serif wordmark 'GROUNDHOGE DAY' below. "
        "Small '$HOGE' ticker tag. Flat vector style. Looks like a modern DeFi protocol logo. "
        "Minimalist, tech-forward, iconic silhouette."
    ),
    (
        "04_bloomberg_badge",
        "A Bloomberg terminal-style badge logo for '$HOGE'. "
        "Dark amber (#ffaa00) monospace text '$HOGE' in bold on black background, "
        "with 'GROUNDHOGE DAY' in small caps below. "
        "ASCII-art style groundhog face to the left made of monospace characters. "
        "Thin rectangular border frame. Financial terminal aesthetic. "
        "High-contrast, retro-futuristic, institutional trader vibe."
    ),
    (
        "05_meme_coin_classic",
        "A classic crypto meme coin logo for 'HOGE'. "
        "Circular coin design. Cute cartoon groundhog face in the center, looking confused and adorable, "
        "in the style of the Dogecoin Shiba Inu meme logo but it's a groundhog. "
        "Gold/amber coin with 'HOGE' text below the face. Clean flat illustration style. "
        "Friendly, approachable, meme-ready. Transparent or white background."
    ),
    (
        "06_government_stamp",
        "A government classification stamp logo. Rectangular stamp design with "
        "'GROUNDHOGE DAY ECONOMIC AUTHORITY' as the header text. "
        "A stylized groundhog silhouette in the middle. "
        "Bottom text reads 'ESTABLISHED 1883 - GOBBLER'S KNOB, PA'. "
        "Red ink stamp effect on weathered cream paper background. "
        "Imperfect edges like a real rubber stamp imprint. "
        "Official bureaucratic document aesthetic. Typography looks like a classified document stamp."
    ),
    (
        "07_art_deco_seal",
        "An art deco style logo for 'GROUNDHOGE DAY'. "
        "Geometric sunburst pattern radiating behind a regal groundhog silhouette in profile. "
        "1920s luxury hotel or bank aesthetic. Gold and black color palette. "
        "'GROUNDHOGE DAY' in elegant art deco serif typeface above, "
        "'$HOGE' in monospace below. Symmetric, ornate, elegant. "
        "Gatsby-era financial institution vibe."
    ),
    (
        "08_cyberpunk_terminal",
        "A cyberpunk terminal-inspired logo. "
        "Glitchy green phosphor text 'GROUNDHOGE DAY' on pure black background, "
        "CRT scanline effect. A pixelated 8-bit groundhog sprite above the text. "
        "'$HOGE' in smaller text below with a blinking cursor character. "
        "Retro computer terminal aesthetic. Matrix-style digital rain subtle in background. "
        "Neo-noir crypto hacker vibe."
    ),
]


def generate(name: str, prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio="1:1",
                    image_size="2K",
                ),
            ),
        )
        for part in response.parts:
            if part.inline_data:
                img = part.as_image()
                path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
                img.save(path)
                return f"OK {name} -> {path}"
        return f"FAIL {name}: no image in response"
    except Exception as e:
        return f"ERROR {name}: {e}"


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(generate, name, prompt) for name, prompt in LOGOS]
        for future in futures:
            print(future.result(), flush=True)


if __name__ == "__main__":
    main()
