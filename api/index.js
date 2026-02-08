/**
 * IconFlow API - The Unified Icon Engine
 * Handles: Custom Brands, Material Design, FontAwesome, and more.
 */

export const config = { runtime: 'edge' };

// 1. CUSTOM BRAND LIBRARY (The "Logos" we were hardcoding)
const BRAND_ICONS = {
    'google': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.98h5.36c-.28 1.6-1.65 4.38-5.36 4.38-3.23 0-5.85-2.65-5.85-5.96s2.62-5.96 5.85-5.96c1.83 0 3.14.78 3.84 1.44l2.25-2.28C16.7 4.29 14.54 3.5 12.18 3.5c-5.18 0-9.38 4.2-9.38 9.38s4.2 9.38 9.38 9.38c5.4 0 8.98-3.8 8.98-9.14 0-.74-.08-1.42-.16-1.92z"/></svg>',
    'github': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>',
    'facebook': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.17 6 13.54 6c1.14 0 2.32.2 2.32.2v2.55h-1.3c-1.25 0-1.63.77-1.63 1.56V12h2.87l-.46 3h-2.41v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>',
    'apple': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.52.88 3.33.88.82 0 2.37-1.09 3.98-0.93 1.12.09 2.15.65 2.72 1.48-2.61 1.35-2.18 5.25.46 6.43-.54 1.57-1.35 3.12-2.6 4.75zM15 5.58c.67-1.15.54-2.73 0-3.58-.8 0-2.07.49-2.75 1.66-.58.98-.44 2.56.03 3.52.74.05 1.99-.5 2.72-1.6z"/></svg>',
    'developer': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
};

export default async function handler(request) {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || 'circle').toLowerCase();
    const color = searchParams.get('color') || 'black';
    const size = searchParams.get('size') || '24';

    let svgRaw = '';

    // --- STRATEGY 1: Check Custom Brand Library ---
    if (BRAND_ICONS[q]) {
        svgRaw = BRAND_ICONS[q];
    } 
    // --- STRATEGY 2: Fetch from Public Iconify Network ---
    else {
        // Map simple names to Iconify IDs
        const mapping = {
            'menu': 'mdi:menu',
            'settings': 'mdi:cog',
            'rocket': 'mdi:rocket-launch',
            'user': 'mdi:account',
            'check': 'mdi:check-circle',
            'dev': 'mdi:code-tags',
            'code': 'mdi:code-tags'
        };
        
        // If query has a colon (fa:home), use it. Else check map, else default to mdi.
        const iconID = mapping[q] || (q.includes(':') ? q : `mdi:${q}`);
        const [set, name] = iconID.split(':');
        
        try {
            const res = await fetch(`https://api.iconify.design/${set}/${name}.svg`);
            if (res.ok) svgRaw = await res.text();
        } catch (e) {
            console.error(e);
        }
    }

    // --- STRATEGY 3: Fallback (If nothing found) ---
    if (!svgRaw) {
        // Return a generic "question mark" icon
        svgRaw = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>';
    }

    // --- PROCESSING: Inject Size and Color ---
    const cleanColor = (color.match(/^[0-9a-fA-F]{3,6}$/)) ? `#${color}` : color;
    
    // 1. Remove existing width/height
    svgRaw = svgRaw.replace(/width=".*?"/, '').replace(/height=".*?"/, '');
    
    // 2. Add new width/height
    svgRaw = svgRaw.replace('<svg', `<svg width="${size}" height="${size}"`);

    // 3. Inject Color (Replace 'currentColor' and force fill)
    svgRaw = svgRaw.replace(/currentColor/g, cleanColor);
    if (!svgRaw.includes('fill="')) {
        svgRaw = svgRaw.replace('<svg', `<svg fill="${cleanColor}"`);
    }

    // Return the SVG
    return new Response(svgRaw, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*'
        }
    });
      }
