/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    // fontSize: {
    //   sm: ['11px', '16px'],
    //   md: ['13px', '16px'],
    //   lg: ['16px', '24px'],
    //   xl: ['18px', '32px'],
    //   h4: ['16px', '16px'],
    //   h3: ['18px', '24px'],
    //   h2: ['24px', '32px'],
    //   h1: ['36px', '40px'],
    //   title: ['55px', '64px'],
    // },
    screens: {
      xsm: '575px',
      sm: '767px',
      md: '991px',
      lg: '1199px',
      xlg: '1399px',
    },
    backgroundImage: {
      'custom-bg': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='%232a0b8e' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='%239262cf' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='%230e47b6' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='%237564cf' points='337 900 398 662 816 900'/%3E%3Cpolygon fill='%237051d6' points='1203 546 1552 900 876 900'/%3E%3Cpolygon fill='%236557df' points='1203 546 1552 900 1162 900'/%3E%3Cpolygon fill='%236f64c9' points='641 695 886 900 367 900'/%3E%3Cpolygon fill='%235148eb' points='587 900 641 695 886 900'/%3E%3Cpolygon fill='%237f71bc' points='1710 900 1401 632 1096 900'/%3E%3Cpolygon fill='%237b2ff7' points='1710 900 1401 632 1365 900'/%3E%3Cpolygon fill='%238c86a4' points='1210 900 971 687 725 900'/%3E%3Cpolygon fill='%236a11fb' points='943 900 1210 900 971 687'/%3E%3C/svg%3E\")",
    },
    boxShadow: {
      'border-b': '0px 1px 0px 0px #eeeeee',
      'elevation-low': '0 4px 16px -4px rgba(0,0,0,0.20)',
      'elevation-medium': '0 12px 40px -8px rgba(0,0,0,0.20)',
      'elevation-high': '0 8px 32px 0 rgba(0,0,0,0.16)',
      'elevation-top': '0 16px 72px -12px rgba(0,0,0,0.20)',
    },
    extend: {
      borderRadius: {
        2: '2px',
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        4: '4px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        28: '28px',
        32: '32px',
        36: '36px',
        40: '40px',
        44: '44px',
        48: '48px',
        52: '52px',
        56: '56px',
        60: '60px',
        64: '64px',
        68: '68px',
        72: '72px',
        76: '76px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        pulse: 'pulse 2.7s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    import('tailwindcss-animate'),
  ],
};

export default config;
