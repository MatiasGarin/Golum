/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Design tokens mapped to CSS variables (see index.css). This keeps the
        // exact palette and the light/dark switch without rewriting colors.
        pr: 'var(--pr)',
        'pr-h': 'var(--pr-h)',
        'pr-l': 'var(--pr-l)',
        bg: 'var(--bg)',
        card: 'var(--card)',
        sb: 'var(--sb)',
        'sb-h': 'var(--sb-h)',
        'sb-a': 'var(--sb-a)',
        inp: 'var(--inp)',
        mod: 'var(--mod)',
        t1: 'var(--t1)',
        t2: 'var(--t2)',
        tm: 'var(--tm)',
        tsb: 'var(--tsb)',
        bd: 'var(--bd)',
        bdf: 'var(--bdf)',
        ok: 'var(--ok)',
        'ok-l': 'var(--ok-l)',
        wa: 'var(--wa)',
        'wa-l': 'var(--wa-l)',
        er: 'var(--er)',
        'er-l': 'var(--er-l)',
        in: 'var(--in)',
        'in-l': 'var(--in-l)',
        pu: 'var(--pu)',
        'pu-l': 'var(--pu-l)',
      },
      borderRadius: {
        DEFAULT: '8px',
        r: '8px',
        rl: '14px',
        rx: '20px',
        rf: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sh0: '0 1px 2px rgba(0,0,0,.05)',
        sh: '0 4px 6px rgba(0,0,0,.07)',
        shl: '0 10px 25px rgba(0,0,0,.1)',
        shx: '0 20px 50px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
}
