# Multi-Tenant Portfolio Generator TODOs

## 📋 Task 1: Setup Prisma Schema (Better Auth + Multi-Tenant Domains)
**Konteks:** Menggunakan Next.js App Router, Supabase (PostgreSQL), dan Better Auth. Perlu membuat/update file `prisma/schema.prisma` agar kompatibel dengan standar Better Auth, dan tambahkan tabel khusus untuk arsitektur multi-tenant (Subdomain & Custom Domain).

**Instruksi Detail:**
- [x] Generate model standar Better Auth: `User`, `Session`, `Account`, dan `Verification`.
- [x] Tambahkan kolom `githubUsername`, `githubId`, dan `githubInstallationId` pada model `User`.
- [x] Buat model `Domain` yang berelasi One-to-Many dengan `User`.
- [x] Model `Domain` harus memiliki properti: `hostname` (String, Unique), `isCustom` (Boolean, default: false), dan `isActive` (Boolean).
- [x] Buat script untuk menjalankan `npx prisma db push` setelah skema selesai dibuat.

---

## 📋 Task 2: Konfigurasi Better Auth (Khusus GitHub)
**Konteks:** Menggunakan GitHub OAuth App untuk proses login dan identity.

**Instruksi Detail:**
- [x] Buat file konfigurasi `lib/auth.ts` menggunakan library `better-auth`.
- [x] Terapkan `prismaAdapter` untuk menghubungkan Better Auth dengan Prisma Client.
- [x] Aktifkan social provider `github` dengan membaca kredensial dari `process.env.GITHUB_CLIENT_ID` dan `process.env.GITHUB_CLIENT_SECRET`.
- [x] Buat Route Handler Next.js di `app/api/auth/[...all]/route.ts` untuk menangani endpoint login/callback standar dari Better Auth.

---

## 📋 Task 3: Utility Service untuk GitHub App Token (Zero-DB Content)
**Konteks:** Setelah user login, kita butuh akses membaca file Markdown dari repositori GitHub mereka menggunakan metode GitHub App Authentication. Private key tersimpan di local environment.

**Instruksi Detail:**
- [x] Buat folder/file utilitas di `lib/github/auth.ts`.
- [x] Gunakan library seperti `jsonwebtoken` (atau `jose`) untuk membaca file `portfolio-zero-db.private-key.pem` dari direktori rahasia lokal (`.secret`).
- [x] Buat fungsi `getGitHubInstallationToken(installationId)` yang men-generate JWT dan menukarnya dengan akses token sementara dari API GitHub.
- [x] Buat fungsi fetcher `getPortfolioMarkdown(username, repo)` yang menggunakan token tersebut untuk mengambil file `overview.md` (atau `README`) secara stateless tanpa menyimpannya ke database.

---

## 📋 Task 4: Next.js Middleware untuk Multi-Tenant Routing
**Konteks:** Domain utama adalah `porto.social` (untuk pendaftaran SaaS/Landing Page). Setiap user akan mendapatkan subdomain otomatis seperti `khalifaalhasan.porto.social`. Jika nanti ada fitur berbayar, kita akan mengaktifkan rute custom domain.

**Instruksi Detail:**
- [x] Buat file `middleware.ts` di root directory.
- [x] Tangkap `hostname` dari setiap request yang masuk.
- [x] **Logika 1 (Landing Page):** Jika hostname adalah `localhost`, `porto.social`, atau `www.porto.social`, biarkan request diteruskan ke `app/page.tsx`.
- [x] **Logika 2 (Subdomain):** Jika hostname berakhiran `.porto.social`, ekstrak username-nya (misal: `khalifaalhasan`), lalu gunakan `NextResponse.rewrite()` untuk mengarahkannya ke halaman dinamis, contoh: `app/[domain]/page.tsx`.
- [x] **Logika 3 (Custom Domain - Persiapan MVP):** Jika hostname bukan keduanya, lakukan pencarian ke API internal/Prisma untuk mengecek pemilik custom domain tersebut, lalu rewrite ke direktori pengguna yang sama.

---

## 📋 Task 5: Optimasi Gambar Statis dengan Microlink + Cache
**Konteks:** Render UI portofolio harus secepat kilat. Kita tidak akan menyimpan screenshot repository ke dalam storage. Kita menggunakan Microlink untuk men-generate gambar perangkat, dan memanfaatkan Next.js Image Edge Cache.

**Instruksi Detail:**
- [x] Buat utility function `getOptimizedScreenshotUrl(repoUrl)` yang me-return URL API Microlink.
- [x] URL tersebut harus menyertakan parameter `waitForTimeout=2500` (agar animasi web selesai sebelum di-screenshot) dan `device=iphone 13` (atau macbook).
- [x] Konfigurasi `next.config.mjs` di bagian `images.remotePatterns` agar mengizinkan `api.microlink.io` dengan `minimumCacheTTL` yang sangat tinggi (misal: 1 bulan).
- [x] Saat render di komponen `<Image />`, gunakan URL dari utility tersebut.

---

## 📋 Task 6: Endpoint Cache Pre-Warming (The Speed Hack)
**Konteks:** Kita ingin recruiter merasakan load time 0 detik. Kita butuh sebuah API Route khusus yang akan dieksekusi oleh GitHub Actions untuk "memanaskan" cache Next.js Image sebelum perekrut datang.

**Instruksi Detail:**
- [x] Buat Route Handler di `app/api/warmup/route.ts`.
- [x] Lindungi endpoint ini dengan secret key dari `.env`.
- [x] Di dalam fungsinya, fetch data repositori user, lalu lakukan simulasi HTTP GET (`fetch()`) ke endpoint internal Next.js `/_next/image?url=URL_MICROLINK&w=1080&q=75`.
- [x] Proses ini akan memaksa Next.js mengunduh gambar dari Microlink dan menyimpannya ke Edge Cache Vercel/Server secara permanen.
