export type ThemeMode = "light" | "dark" | "system";
export const THEME_KEY = "rb_admin_theme";

/** Executado antes da pintura para evitar "piscar" o tema errado. */
export const themeBootScript = `(function(){try{var m=localStorage.getItem('${THEME_KEY}')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('admin-dark',d);}catch(e){}})();`;
