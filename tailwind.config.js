export default {
 darkMode: ['selector', '.app-dark'], content: ['./src/**/*.{html,ts}'],
 theme: { screens: { 'min-v-mobile': {max:'450px'}, sm:'576px', md:'768px', lg:'992px', xl:'1200px', '2xl':'1920px' },
 extend: { colors: { primary: {DEFAULT:'rgb(var(--gg-primary-rgb) / <alpha-value>)', contrast:'var(--mat-sys-on-primary)', 50:'var(--gg-primary-50)',100:'var(--gg-primary-100)',200:'var(--gg-primary-200)',300:'var(--gg-primary-300)',400:'var(--gg-primary-400)',500:'var(--gg-primary-500)',600:'var(--gg-primary-600)',700:'var(--gg-primary-700)',800:'var(--gg-primary-800)',900:'var(--gg-primary-900)',950:'var(--gg-primary-950)'}, surface:Object.fromEntries([0,50,100,200,300,400,500,600,700,800,900,950].map(t=>[t,'rgb(var(--gg-surface-rgb-'+t+') / <alpha-value>)'])) } } }, plugins: []
};
