# Dars jadvali sayti (Vercel + Neon)

Hamma ko'radigan jadval sayti va parol bilan saqlanadigan admin sahifasi.

- Sayt: `https://SIZNING-SAYT.vercel.app/`
- Admin: `https://SIZNING-SAYT.vercel.app/sardorxon/admin`
  - Sahifaning o'zi parolsiz ochiladi.
  - O'zgarishlarni saqlashda parol so'raladi. Bu parolni bilmagan odam jadvalni o'zgartira olmaydi.

## Fayllar

```
public/index.html    sayt va admin (ikkalasi bitta fayl, yo'liga qarab ishlaydi)
api/schedule.js      jadvalni Neon bazasidan o'qiydi va yozadi
vercel.json          /sardorxon/admin yo'lini sahifaga ulaydi
package.json         kerakli kutubxona (@neondatabase/serverless)
```

## Ishga tushirish (taxminan 10 daqiqa)

### 1. Neon bazasini oching
1. https://neon.tech saytida ro'yxatdan o'ting (bepul reja yetadi).
2. Yangi **Project** yarating.
3. Dashboard'da **Connection string** ni nusxalang. U `postgresql://...` bilan boshlanadi.
   Oxirida `?sslmode=require` bo'lishi kerak.

Jadval va boshlang'ich darslar birinchi so'rovda o'zi yaratiladi, qo'lda SQL yozish shart emas.

### 2. Loyihani GitHub'ga yuklang
1. https://github.com da yangi repository yarating (masalan, `dars-jadvali`).
2. Shu papkadagi fayllarni (`public`, `api`, `vercel.json`, `package.json`) repository'ga yuklang.
   GitHub'da "Add file → Upload files" orqali sudrab tashlasangiz bo'ladi.

### 3. Vercel'da e'lon qiling
1. https://vercel.com da GitHub hisobingiz bilan kiring.
2. **Add New → Project** bosib, `dars-jadvali` repository'sini tanlang.
3. **Environment Variables** bo'limiga ikkita qiymat kiriting:
   - `DATABASE_URL` : Neon'dan nusxalagan connection string
   - `ADMIN_PASSWORD` : o'zingiz o'ylab topgan parol (uzunroq va boshqa joyda ishlatilmagan bo'lsin)
4. **Deploy** ni bosing.

### 4. Tekshiring
1. `https://SIZNING-SAYT.vercel.app/` ni oching, jadval ko'rinishi kerak.
2. `https://SIZNING-SAYT.vercel.app/sardorxon/admin` ni oching.
3. Bir darsni boshqa katakka sudrab, **Saqlash** ni bosing va parolni kiriting.
4. Asosiy sahifani qayta oching: o'zgarish hammada ko'rinadi.

## Foydali

- Parolni o'zgartirish: Vercel → Project → Settings → Environment Variables → `ADMIN_PASSWORD`, so'ng **Redeploy**.
- O'z domeningizni ulash: Vercel → Project → Settings → Domains.
- Ochiq turgan sahifa jadvalni har 60 soniyada o'zi yangilaydi.
- Jadvalni boshlang'ich holatiga qaytarish: Neon → SQL Editor'da `DELETE FROM schedule;` ishga tushiring.
