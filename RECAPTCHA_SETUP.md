# reCAPTCHA Setup Guide for Haven & Honey

## ✅ What's Been Done

Bot protection has been added to the contact form using Google reCAPTCHA v3 (invisible - no checkboxes for users!).

## 🔑 Get Your reCAPTCHA Keys

1. Go to: https://www.google.com/recaptcha/admin
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label:** Haven & Honey
   - **reCAPTCHA type:** Select **reCAPTCHA v3**
   - **Domains:** Add `havenhoney.co` and `www.havenhoney.co`
   - Accept terms and click **Submit**

4. You'll get two keys:
   - **Site Key** (starts with `6L...`)
   - **Secret Key** (starts with `6L...`)

## 📝 Add Keys to Environment Variables

### On Your Local Machine:

Edit `.env.local` file and replace the placeholder values:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### On Your Server (EC2):

SSH into your server and edit the environment file:

```bash
ssh your-server
cd /home/ec2-user/haven-honey
nano .env.local
```

Add the same keys:
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Save and exit (Ctrl+X, then Y, then Enter)

## 🚀 Deploy

After adding the keys, deploy:

```bash
./deploy.sh
```

Or manually:
```bash
cd /home/ec2-user/haven-honey
git pull origin main
npm install
npm run build
pm2 restart haven-honey
pm2 save
```

## 🧪 Test It

1. Go to https://havenhoney.co
2. Fill out the contact form
3. Submit it
4. Check that:
   - ✅ Real submissions work fine
   - ✅ Bot submissions are blocked (score < 0.5)

## 📊 Monitor Bot Activity

Go to your reCAPTCHA admin panel to see:
- How many requests are being made
- Bot detection scores
- Suspicious activity

## 🔧 How It Works

1. **User fills form** → reCAPTCHA runs invisibly in background
2. **User clicks submit** → Token is generated
3. **Token sent to server** → Server verifies with Google
4. **Google returns score** → 0.0 (bot) to 1.0 (human)
5. **If score < 0.5** → Submission blocked
6. **If score ≥ 0.5** → Submission accepted

## 🎯 For Other Sites

To add this to other sites, copy these files:
- `src/components/ReCaptchaProvider.tsx`
- The reCAPTCHA code in `src/components/ContactForm.tsx`
- The verification code in `src/app/api/contact/route.ts`

Then get new reCAPTCHA keys for each domain!

---

**Questions?** Contact JT or check the Google reCAPTCHA docs: https://developers.google.com/recaptcha/docs/v3
