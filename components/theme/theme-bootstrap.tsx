import { themeCookieName } from "@/lib/theme";

const script = `
(function () {
  try {
    var raw = document.cookie.split('; ').find(function (c) {
      return c.indexOf('${themeCookieName}=') === 0;
    });
    if (!raw) return;
    var json = decodeURIComponent(raw.split('=')[1]);
    var prefs = JSON.parse(json);
    var html = document.documentElement;
    if (prefs.theme) html.setAttribute('data-theme', prefs.theme);
    if (prefs.accent) html.setAttribute('data-accent', prefs.accent);
    if (prefs.density) html.setAttribute('data-density', prefs.density);
  } catch (_) {}
})();
`;

export function ThemeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
