PHOTOS FOR THE "HANDS-ON IT WORK" CARDS
=======================================

Put your job photos in this folder (assets/jobs/).

1. Name them after the job number in js/config.js (IT_JOBS):
     001.jpg                         -> one photo for JOB #001
     001-before.jpg, 001-after.jpg   -> before/after slider for JOB #001
     002-before.jpg, 002-after.jpg   -> and so on

2. Make them small before you add them:
     - max 1600 px wide (1200 px is plenty)
     - JPG, quality about 80
     - Free tools: Squoosh (https://squoosh.app) or Windows Photos > Resize.

3. Add the file names to that job in js/config.js, for example:
     photos: ['assets/jobs/001-before.jpg', 'assets/jobs/001-after.jpg']

Tips
- Only use photos of work you really did.
- Blur or crop out customer names, faces, passwords and serial numbers.
- If a photo file is missing, the card shows an icon instead (never a broken image).
