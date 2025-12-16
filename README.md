# Dijital Kavram Öğretimi (OE Cards)

Bu depo statik bir HTML/CSS/JS uygulaması. Vercel üzerinde ek build adımı olmadan yayınlanabilir.

## Yerel çalıştırma
- Klasörde bir HTTP sunucusu başlatın (ör. `python3 -m http.server 4173` veya Vercel CLI ile `vercel dev`).
- Tarayıcıdan `http://localhost:4173` adresini açın.

## Vercel deploy (hızlı kurulum)
1. Vercel CLI kurulu değilse: `npm i -g vercel`
2. Oturum açın: `vercel login`
3. Bu klasörde ilk deploy: `vercel` (soruları onaylayın, proje adı otomatik `oe-cards` gelir)
4. Production deploy: `vercel --prod`

`vercel.json` dosyası statik dosya sunumunu ve temel cache başlıklarını ayarlar; başka bir build adımına gerek yoktur. Görselleri `assets/images/` içine ekleyip `data/concepts.json` içindeki `src` alanlarını güncellemeniz yeterlidir.
