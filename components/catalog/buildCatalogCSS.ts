import { CatalogTheme } from '@/types/catalog';

export function buildCatalogCSS(t: CatalogTheme) {
  const r = t.border_radius === 'pill' ? '999px' : t.border_radius === 'rounded' ? '16px' : '6px';
  const rSm = t.border_radius === 'pill' ? '999px' : t.border_radius === 'rounded' ? '10px' : '4px';
  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=${t.font_family.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap');
:root{
  --p:${t.primary_color};--s:${t.secondary_color};
  --bg:${t.background_color};--sf:${t.surface_color};--tx:${t.text_color};
  --r:${r};--rsm:${rSm};
  font-family:'${t.font_family}',system-ui,sans-serif
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased}
.cover-wrap{position:relative;width:100%;height:240px;background:#111;overflow:hidden}
@media(min-width:640px){.cover-wrap{height:320px}}
.cover-img{width:100%;height:100%;object-fit:cover;opacity:.85;transition:transform 8s ease}
.cover-img:hover{transform:scale(1.03)}
.cover-gradient{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.05) 0%,rgba(0,0,0,.55) 100%);pointer-events:none}
.status-pill{position:absolute;top:16px;right:16px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;backdrop-filter:blur(8px)}
.status-open{background:rgba(34,197,94,.9);color:white}
.status-closed{background:rgba(239,68,68,.85);color:white}
.logo-anchor{max-width:900px;margin:0 auto;padding:0 24px}
.logo-float{width:76px;height:76px;border-radius:20px;border:3px solid var(--bg);object-fit:cover;box-shadow:0 4px 20px rgba(0,0,0,.15);margin-top:-38px;display:block;position:relative;z-index:10;background:var(--sf)}
.logo-float-placeholder{width:76px;height:76px;border-radius:20px;border:3px solid var(--bg);background:var(--p);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.15);margin-top:-38px;position:relative;z-index:10;font-size:30px;font-weight:800;color:white}
.logo-no-cover{width:64px;height:64px;border-radius:16px;object-fit:cover;border:2px solid rgba(0,0,0,.07);flex-shrink:0}
.logo-no-cover-placeholder{width:64px;height:64px;border-radius:16px;background:var(--p);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;flex-shrink:0}
.store-info{padding:16px 20px 0;max-width:900px;margin:0 auto}
.search-wrap{position:relative;margin-bottom:16px}
.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:rgba(0,0,0,.3)}
.input{width:100%;padding:12px 16px;border-radius:var(--r);border:1.5px solid rgba(0,0,0,.08);background:var(--sf);font-size:14px;font-family:inherit;color:var(--tx);outline:none;transition:all .2s}
.input:focus{border-color:var(--p);box-shadow:0 0 0 3px color-mix(in srgb,var(--p) 12%,transparent)}
.search-input{padding-left:44px}
.cats-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:24px;scrollbar-width:none}
.cats-scroll::-webkit-scrollbar{display:none}
.cat-chip{padding:8px 18px;border-radius:999px;font-size:13px;font-weight:600;border:2px solid transparent;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
.cat-chip.active{background:var(--p);color:white}
.cat-chip.inactive{background:transparent;color:var(--tx);border-color:rgba(0,0,0,.1)}
.cat-chip.inactive:hover{border-color:var(--p);color:var(--p)}
.prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;padding-bottom:120px}
.prod-card{background:var(--sf);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;border:1.5px solid rgba(0,0,0,.04)}
.prod-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1)}
.prod-img-wrap{height:140px;overflow:hidden;background:#e5e5e5;position:relative}
.prod-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
.prod-card:hover .prod-img{transform:scale(1.06)}
.promo-badge{position:absolute;top:8px;left:8px;background:var(--p);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px}
.prod-body{padding:12px}
.qty-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid rgba(0,0,0,.1);cursor:pointer;background:white;color:var(--tx);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.qty-btn:hover{background:var(--p);color:white;border-color:var(--p)}
.cart-fab{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:480px;background:linear-gradient(135deg,var(--p),var(--s));color:white;border:none;border-radius:var(--r);padding:16px 20px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between;box-shadow:0 8px 28px color-mix(in srgb,var(--p) 45%,transparent);transition:transform .2s,box-shadow .2s;font-family:inherit;z-index:50;animation:fabIn .4s cubic-bezier(.34,1.56,.64,1) both}
@keyframes fabIn{from{transform:translateX(-50%) translateY(80px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.cart-fab:hover{transform:translateX(-50%) translateY(-2px);box-shadow:0 12px 36px color-mix(in srgb,var(--p) 55%,transparent)}
.checkout-section{background:var(--sf);border-radius:var(--r);padding:20px;margin-bottom:16px;border:1.5px solid rgba(0,0,0,.05);animation:sectionIn .3s ease both}
@keyframes sectionIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.section-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);margin-bottom:14px}
.type-btn{flex:1;padding:14px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.08);background:white;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:6px;font-family:inherit}
.type-btn.active{border-color:var(--p);background:color-mix(in srgb,var(--p) 6%,white)}
.type-btn-label{font-size:13px;font-weight:600;color:var(--tx)}
.pay-btn{flex:1;min-width:0;padding:12px 8px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.08);background:white;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:inherit}
.pay-btn.active{border-color:var(--p);background:color-mix(in srgb,var(--p) 6%,white)}
.pay-label{font-size:11px;font-weight:600;color:var(--tx)}
.summary-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px;border-bottom:1px solid rgba(0,0,0,.06)}
.summary-row:last-child{border-bottom:none}
.summary-total{font-size:18px;font-weight:800;color:var(--p)}
.btn-confirm{width:100%;padding:16px;border-radius:var(--r);border:none;background:linear-gradient(135deg,var(--p),var(--s));color:white;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 4px 16px color-mix(in srgb,var(--p) 35%,transparent)}
.btn-confirm:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px color-mix(in srgb,var(--p) 45%,transparent)}
.btn-confirm:disabled{opacity:.6;cursor:not-allowed}
.btn-back{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:var(--rsm);border:1.5px solid rgba(0,0,0,.1);background:transparent;cursor:pointer;font-size:14px;font-weight:600;color:var(--tx);font-family:inherit;transition:all .2s;margin-bottom:24px}
.btn-back:hover{border-color:var(--p);color:var(--p)}
.zone-card{padding:12px 14px;border-radius:var(--rsm);border:2px solid rgba(0,0,0,.07);background:white;cursor:pointer;transition:all .2s;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.zone-card.selected{border-color:var(--p);background:color-mix(in srgb,var(--p) 5%,white)}
.zone-card:hover{border-color:var(--p)}
.cart-item-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06)}
.cart-item-row:last-child{border-bottom:none}
.cart-item-thumb{width:44px;height:44px;border-radius:10px;object-fit:cover;background:#eee;flex-shrink:0}
.success-wrap{max-width:480px;margin:0 auto;padding:40px 24px;text-align:center}
.success-icon{width:88px;height:88px;border-radius:50%;background:color-mix(in srgb,var(--p) 12%,white);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both}
@keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.success-number{font-size:48px;font-weight:800;color:var(--p);line-height:1;margin-bottom:4px;animation:countIn .6s ease both .2s}
@keyframes countIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.prog-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;transition:all .3s;flex-shrink:0}
.prog-dot.done{background:var(--p);color:white}
.prog-dot.active{background:var(--p);color:white;box-shadow:0 0 0 4px color-mix(in srgb,var(--p) 20%,transparent)}
.prog-dot.pending{background:rgba(0,0,0,.08);color:rgba(0,0,0,.3)}
.prog-line{flex:1;height:2px;background:rgba(0,0,0,.08);margin:0 8px;border-radius:999px;overflow:hidden}
.prog-line-fill{height:100%;background:var(--p);border-radius:999px;transition:width .4s ease}
.spinner{width:36px;height:36px;border-radius:50%;border:3px solid color-mix(in srgb,var(--p) 20%,transparent);border-top-color:var(--p);animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.skeleton{background:linear-gradient(90deg,rgba(0,0,0,.06) 25%,rgba(0,0,0,.04) 50%,rgba(0,0,0,.06) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.prod-section-header{display:flex;align-items:center;gap:12px;margin-bottom:12px;margin-top:0}
.prod-section-tag{font-size:13px;font-weight:700;white-space:nowrap;padding:4px 12px;border-radius:999px;background:color-mix(in srgb,var(--p) 12%,transparent);color:var(--p)}
.promo-tag{background:color-mix(in srgb,var(--p) 15%,transparent);color:var(--p)}
.prod-section-line{flex:1;height:1.5px;background:rgba(0,0,0,.07);border-radius:999px}
.promo-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.promo-scroll::-webkit-scrollbar{display:none}
.promo-scroll .prod-card{min-width:160px;max-width:160px;flex-shrink:0}
.empty{text-align:center;padding:48px 24px;color:rgba(0,0,0,.35)}
@media(max-width:480px){.prod-grid{grid-template-columns:repeat(2,1fr)}}
`;
}
