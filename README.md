# Weight Training Planner

เว็บแอปสร้างโปรแกรมฝึกเวทรายสัปดาห์แบบไดนามิก ตามเป้าหมาย ระดับประสบการณ์ จำนวนวันที่ว่าง และสถานที่ฝึกของแต่ละคน

> โปรเจกต์นี้สร้างขึ้นเพื่อใช้งานส่วนตัวเท่านั้น ไม่ได้จัดทำเพื่อจำหน่ายหรือหวังผลกำไร

## ฟีเจอร์

- เลือก 4 หมวดหมู่: เป้าหมาย (เพิ่มกล้าม / ลดไขมัน / เพิ่มแรง / ทั่วไป), ระดับประสบการณ์ (มือใหม่ / กลาง / สูง), จำนวนวัน/สัปดาห์ (3–6 วัน), สถานที่ (ยิม / บ้านมีดัมเบล / บ้านไม่มีอุปกรณ์ / กลางแจ้ง)
- สร้างโปรแกรมแบบไดนามิกจากฐานข้อมูลท่าออกกำลังกาย 62 ท่า — ไม่ใช่ชุดคำตอบสำเร็จรูป
- แบ่ง training split อัตโนมัติตามจำนวนวัน (Full Body / Upper-Lower / Push-Pull-Legs)
- กรองท่าตามอุปกรณ์ที่มีจริงในแต่ละสถานที่
- จัดลำดับความยากของท่าให้เหมาะกับมือใหม่ก่อน (อ้างอิงแนวทาง ACSM/NSCA) โดยไม่ตัดท่าไหนออก
- แสดง GIF ท่าออกกำลังกายจริง พร้อม fallback เป็นไอคอน SVG อัตโนมัติหากไม่มีไฟล์
- ผลลัพธ์คงที่ (deterministic) — เงื่อนไขเดิมได้โปรแกรมเดิมทุกครั้ง แต่มีความหลากหลายระหว่างวันในสัปดาห์เดียวกัน

## เทคโนโลยีที่ใช้

Next.js 14 (App Router) · TypeScript · Tailwind CSS

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### ดาวน์โหลดรูป/GIF ท่าออกกำลังกาย (ไม่บังคับ)

โปรเจกต์นี้ไม่ commit ไฟล์ GIF ท่าออกกำลังกาย เพราะเป็นข้อมูลจากเดตาเซตภายนอกที่อนุญาตเฉพาะการใช้งานส่วนตัว/การศึกษา ไม่ใช่เชิงพาณิชย์ รันคำสั่งนี้เพื่อดาวน์โหลดมาเก็บในเครื่องของคุณเอง:

```bash
npm run fetch-photos
```

ถ้าไม่รัน เว็บจะ fallback ไปแสดงไอคอน SVG แทนโดยอัตโนมัติ — ใช้งานได้ปกติทั้งสองแบบ

## โครงสร้างโปรเจกต์

```
app/                หน้าเว็บ (Next.js App Router)
components/         UI components
lib/                ฐานข้อมูลท่าออกกำลังกาย + ตรรกะสร้างโปรแกรม (pure functions)
scripts/            สคริปต์ดาวน์โหลดรูป/GIF ท่าออกกำลังกาย
public/exercises/   ไฟล์ GIF ที่ดาวน์โหลดมา (gitignored)
```

## ข้อมูลอ้างอิง

- การจัดหมวดกล้ามเนื้อ/อุปกรณ์: [ExRx.net Exercise Directory](https://exrx.net/Lists/Directory)
- Push/Pull/Legs split: [Aston University](https://www.aston.ac.uk/sport/news/tips/fitness-exercise/push-pull-legs), [Healthline](https://www.healthline.com/nutrition/push-pull-workout), [StrengthLog](https://www.strengthlog.com/push-pull-legs-split/)
- ระดับความยากของท่าสำหรับมือใหม่: [ACSM – Selecting and Effectively Using Free Weights](https://www.acsm.org/docs/default-source/files-for-resource-library/selecting-and-effectively-using-free-weights.pdf), NSCA exercise-technique guidance
- รูป/GIF ท่าออกกำลังกาย: hasaneyldrm/exercises-dataset (GitHub) — อนุญาตเฉพาะการใช้งานส่วนตัวและการศึกษา ไม่ใช่เชิงพาณิชย์

รายละเอียดการพัฒนาและการแก้ไขทั้งหมด (พร้อมเหตุผลของแต่ละการตัดสินใจ) อยู่ใน [`agent.md`](./agent.md)

## หมายเหตุเรื่องลิขสิทธิ์

เว็บนี้ทำขึ้นเพื่อใช้งานส่วนตัวเท่านั้น ห้ามใช้รูป/GIF ท่าออกกำลังกายที่ดาวน์โหลดผ่าน `npm run fetch-photos` ในผลิตภัณฑ์เชิงพาณิชย์ ตามเงื่อนไข license ของเดตาเซตต้นทาง

## License

โค้ดในโปรเจกต์นี้ใช้ MIT License — ไม่รวมข้อมูล/รูปภาพจากเดตาเซตภายนอกซึ่งมี license แยกต่างหาก
