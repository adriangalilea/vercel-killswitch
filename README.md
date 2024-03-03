Archiving this since Vercel allow hard-limits now, but this may be handy still if you want to use the webhook for something else.

# Vercel Killswitch

## Why
We've all heard AWS horror stories, you wake up one day and see a $XX,XXX bill, I rather not, thanks.

Vercel [recently anounced Spend Management](https://vercel.com/blog/introducing-spend-management-realtime-usage-alerts-sms-notifications) which is a great start but they give you this warning:
> Setting a spend amount does not automatically stop usage. If you want to pause your project at a certain amount, you must configure this through a webhook .

And while they `Promise()`
>Next, we're working on powerful anomaly detection for your spend to proactively alert you when spikes happen, rather than manually adding spend amounts. Stay tuned for more product updates to help you have confidence in your usage on Vercel.

I wanted to have a solution now, so we can actually ship on Fridays 😜

## What
Creates an /api/pause webhook in your Next.js App router Vercel hosted site:
`https://your-project-url.whatever/api/pause`
If it receives the [spend management post payload message](https://vercel.com/docs/accounts/spend-management#spend-amount), your project will automatically pause.

- It checks if the `x-vercel-signature` is valid as explained [here](https://vercel.com/docs/observability/webhooks-overview/webhooks-api#securing-webhooks) so that no one but vercel can pause the project.

# ⚠️Caution
I have **tested only in postman** and my project was paused successfully several times, and while I think this works, there might be unknown circumstances in which it doesn't:
- If your endpoint doesn't work
- If you misspell anything
- If I missunderstood how Vercel will send the post JSON.
 
I urge you to double-check everything, and let me know if it does or it doesn't work so I can update this.

I'm not responsible for any charge you have using this.

## How
1. Install this component in your next.js 14 app.
   a. npm `npm i vercel-killswitch`
   b. manually [`/app/api/pause/route.ts`](https://github.com/adriangalilea/vercel-killswitch/blob/main/app/api/pause/route.ts) -> `/app/api/pause/route.ts`
2. Create the following env variables:
   1. [`VERCEL_PROJECT_ID`](https://vercel.com/docs/projects/overview#project-id)
   2. [`VERCEL_TEAM_ID`](https://vercel.com/docs/accounts/create-a-team#find-your-team-id)
   3. [`VERCEL_PANIC_TOKEN`](https://vercel.com/account/tokens)
   4. `VERCEL_PANIC_SECRET`
3. Set spend Management on your vercel account
   1. `Settings` > `Billing` > `Spend Management`
   2. set an amount
   3. set the webhook
      1. `https://your-project-url.whatever/api/pause`
   4. copy the secret and set it as `VERCEL_PANIC_SECRET`

That's it.

Feel free to modify env variable names.

## Testing
1. Go to [Postman](https://web.postman.co).
2. Set up a new request:
   - Method: `POST`
   - URL: `https://your-project-url.whatever/api/pause`
3. In the request Headers:
   - Key: `x-vercel-signature`
   - Value: `{{signature}}` (This is a variable)
4. In the request Body (select `raw` and `JSON`):
   ```json
   {
     "budgetAmount": 50,
     "currentSpend": 50,
     "teamId": "YOUR TEAM ID HERE!!!!"
   }
   ```
5. In the Pre-request Script:
   ```javascript
   const payload = JSON.stringify({
     "budgetAmount": 50,
     "currentSpend": 50,
     "teamId": "YOUR TEAM ID HERE!!!!"
   });
   const secret = 'YOUR SECRET HERE!!!!';

   const signature = CryptoJS
       .HmacSHA1(payload, secret)
       .toString(CryptoJS.enc.Hex);

   pm.environment.set('signature', signature);
   ```
6. Hit send. Your project should be paused.

## To-do
- [x] Test using postman
- [ ] Test on a real vercel trigger(let me know if it happens to you, or if it doesn't!)
- [x] Publish on npm
- [ ] Publish as a template on Vercel❓
- [ ] Blog post
- [ ] YT video
- [ ] interactive install
  - [ ] letting user choose where `route.ts` get's copied
  - [ ] leading user through the rest of the set-up

## vercel
- [Anouncement](https://vercel.com/blog/introducing-spend-management-realtime-usage-alerts-sms-notifications)
- [Spend Management](https://vercel.com/docs/accounts/spend-management)
- [Pausing a project](https://vercel.com/docs/projects/overview#pausing-a-project)
- [Configuring a webhook](https://vercel.com/docs/accounts/spend-management#configuring-a-webhook)
  - [Spend amount POST](https://vercel.com/docs/accounts/spend-management#spend-amount)
- [Securing webhooks](https://vercel.com/docs/observability/webhooks-overview/webhooks-api#securing-webhooks)
