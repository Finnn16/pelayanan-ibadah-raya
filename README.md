## Dokumentasi Pelayanan Ibadah (Web Sederhana)

Aplikasi kecil untuk mencatat jadwal pelayanan ibadah (WL, Singer, Musik, Tari) per tanggal dan bagian, lalu export ke Excel sesuai format tabel pada contoh.

Fitur singkat:
- Form input: tanggal, bagian, WL/Singer/Musik/Tari (semuanya multi-select berbasis checklist) dari daftar nama tetap.
- Data tersimpan di localStorage browser (tanpa backend) dan langsung tampil pada tabel rekap (baris = bagian, kolom = tanggal → WL/SINGER/MUSIK/TARI).
- Export ke Excel dengan header tanggal digabung (merge) per 4 kolom.
- Hapus data per sel (tanggal+bagian) atau hapus semua.
 - Database opsional untuk master nama (Vercel Postgres) dengan API siap pakai.

Catatan: karena menggunakan localStorage, data tersimpan per browser/perangkat.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, install dependencies and run the development server:

```bash
# install deps (already included):
npm install

# start dev server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

How to use (quick):
1) Buka halaman utama dan isi form Tanggal + Bagian.
2) Pilih nama untuk WL (opsional) dan multi-select untuk Singer/Musik/Tari.
3) Klik “Simpan / Update” → tabel rekap akan terisi.
4) Klik “Export ke Excel” untuk mengunduh file `Laporan_Pelayanan_Ibadah.xlsx`.
5) Tombol “hapus” pada sel WL akan menghapus data untuk kombinasi tanggal+bagian tersebut. “Hapus Semua Data” membersihkan seluruh data localStorage.

Anda bisa mengubah master data nama/bagian di file `pages/index.js` pada konstanta `PEOPLE` dan `SECTIONS`.

## Database (Prisma + Vercel Postgres)

Tujuan: menyimpan master daftar nama pelayan agar tidak hardcode di FE.

1) Buat database di Vercel
- Vercel Dashboard → Storage → Postgres → Create.
- Di Project Settings → Environment Variables, set `DATABASE_URL` = nilai dari `POSTGRES_PRISMA_URL` (Vercel menyediakan variabel ini untuk Prisma).
- Untuk lokal, buat `.env.local` dengan:

```
DATABASE_URL=postgres://... (isi dari POSTGRES_PRISMA_URL)
```

2) Apply schema dan seed data nama (opsional tapi disarankan pertama kali)

```powershell
# generate client
npm run db:generate

# push schema (butuh DATABASE_URL di .env.local)
npx prisma db push

# seed nama default (list yang sudah kamu kirim)
npm run db:seed
```

3) API
- GET `/api/people` → daftar nama aktif.
- POST `/api/people` body: `{ "names": ["Nama 1", "Nama 2", ...] }` → insert unik, idempotent.
- PUT `/api/people/:id` body (opsional): `{ name, active, roles }`.
- DELETE `/api/people/:id`.

Frontend otomatis memanggil GET `/api/people` saat load, dan akan fallback ke daftar lokal jika API kosong/gagal.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
