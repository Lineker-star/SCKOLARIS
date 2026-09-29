// Portage direct des tokens définis dans frontend-web/src/index.css.
// NativeWind n'a pas de <html data-theme>, donc chaque paire clair/sombre
// est exposée sous deux noms : le token normal (valeur claire) et le même
// nom suffixé "-night" (valeur sombre), utilisés ensemble dans les
// composants via `className="bg-surface dark:bg-surface-night"`.
// Les tokens `footer*` sont volontairement identiques dans les deux
// palettes (bande de pied de page toujours bleu marine, cf. Footer web).
module.exports = {
  darkMode: 'class',
  content: ['./App.js', './index.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // --- Palette claire (valeurs par défaut) ---
        surface: '#f8f9ff',
        'surface-dim': '#d1dbeb',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#e0e9f9',
        'surface-container-highest': '#dae3f3',
        'on-surface': '#131c28',
        'on-surface-variant': '#43474f',
        'inverse-surface': '#28313d',
        'inverse-on-surface': '#eaf1ff',
        outline: '#747780',
        'outline-variant': '#c4c6d0',

        primary: '#001c40',
        'on-primary': '#ffffff',
        'primary-container': '#0a3161',
        'on-primary-container': '#7c9ad1',
        'inverse-primary': '#aac7ff',

        secondary: '#765b00',
        'on-secondary': '#ffffff',
        'secondary-container': '#fdd264',
        'on-secondary-container': '#755a00',

        tertiary: '#341400',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#542400',
        'on-tertiary-container': '#d1895b',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        success: '#2f8f5b',
        'success-container': '#e3f5eb',

        background: '#f8f9ff',
        'on-background': '#131c28',
        'surface-variant': '#dae3f3',

        // --- Palette sombre (suffixe "-night") ---
        'surface-night': '#10151f',
        'surface-dim-night': '#0a0e17',
        'surface-bright-night': '#1c2433',
        'surface-container-lowest-night': '#0a0e17',
        'surface-container-low-night': '#151b28',
        'surface-container-night': '#1a2130',
        'surface-container-high-night': '#20293a',
        'surface-container-highest-night': '#263143',
        'on-surface-night': '#e6ebf5',
        'on-surface-variant-night': '#b3bac8',
        'inverse-surface-night': '#e6ebf5',
        'inverse-on-surface-night': '#131c28',
        'outline-night': '#8a90a0',
        'outline-variant-night': '#38405290',

        'primary-night': '#aac7ff',
        'on-primary-night': '#002c5f',
        'primary-container-night': '#0a3161',
        'on-primary-container-night': '#d6e2ff',
        'inverse-primary-night': '#0a3161',

        'secondary-night': '#fdd264',
        'on-secondary-night': '#3d2f00',
        'secondary-container-night': '#584300',
        'on-secondary-container-night': '#fdd264',

        'tertiary-night': '#e0a074',
        'on-tertiary-night': '#4a1f00',
        'tertiary-container-night': '#6b3010',
        'on-tertiary-container-night': '#f0c3a4',

        'error-night': '#ffb4ab',
        'on-error-night': '#690005',
        'error-container-night': '#93000a',
        'on-error-container-night': '#ffdad6',

        'success-night': '#8fdcb0',
        'success-container-night': '#1c4a30',

        'background-night': '#10151f',
        'on-background-night': '#e6ebf5',
        'surface-variant-night': '#38405290',

        // --- Pied de page : bande bleu marine fixe (identique claire/sombre) ---
        footer: '#051224',
        'footer-high': '#0b1e38',
        'on-footer': '#eaf1ff',
        'on-footer-muted': '#93a8cf',
      },
      // TODO (Phase 1) : ajouter @expo-google-fonts/source-sans-3 et
      // déclarer fontFamily.sans ici pour matcher la police du web.
    },
  },
  plugins: [],
}
