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
    require('tailwindcss-animate'), // Include any plugins you use, like this one.
  ],
};

module.exports = config;
