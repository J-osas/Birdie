# How money works on Birdie

This is the staff handbook for payments. Use short words. If someone new joins, give them this page.

Birdie holds the family’s money until the job is done. Then we keep a small fee and pay the professional. The family never pays the professional in cash.

## The numbers (today)

- Birdie keeps **3.5%** of the job bill.
- We wait **3 days** after the job is done before paying (staff can pay sooner).
- The smallest withdrawal is **₦5,000**.
- Change these in **Settings → Money**. New payouts use the new numbers.

Example: the family pays **₦70,000**.

- Birdie keeps **₦2,450**
- The professional can take out **₦67,550**

The meeting fee (the small fee to start a request) is Birdie’s. It is not part of the job bill.

## Where the naira actually sits

1. The family pays with a card.
2. The money goes into **Birdie’s Paystack account**.
3. The professional’s Birdie wallet only **shows** that we are holding it. It is not in their bank yet.
4. When staff pay the professional, the wallet shows “ready to withdraw.”
5. When the professional asks to take money out, and staff approve, Paystack sends that amount from Birdie’s Paystack account to their bank. Birdie’s 3.5% stays in Paystack.

## Who clicks what

**Family**

- Pay the meeting fee
- Pay the bill
- Write a review after the job

**Professional**

- Can click **The job is done**
- Ask to take money out (bank name, account number)

**Staff**

- Mark the meeting done
- Send the bill
- Start the job
- Mark the job done
- Pay the professional (or wait for the 3 days)
- Send the money back if the job never happens
- Approve a withdrawal

## The steps, in order

1. Family sends a request and pays the meeting fee.
2. Staff speak to the family, mark the meeting done, and send a bill.
3. Family pays the bill. The request says Birdie is holding the money. The professional’s wallet **Held** matches the bill.
4. Staff click **Start the job**.
5. Staff or the professional click **The job is done**. Wallet: Held becomes 0. Waiting becomes the bill amount.
6. Wait the days in Settings, or staff click **Pay the professional now**.
7. Birdie keeps 3.5%. The rest becomes **Ready to withdraw**.
8. Professional asks to take the money out.
9. Staff approve on Money. Paystack pays their bank.

## If something goes wrong

- The job never happens, and Birdie is still holding the money → **Send the money back**. The family’s card is refunded. This does not work after the professional has already been paid.
- **The job is done** fails → read the red message on the page. Try again once. If it still fails, tell the person who looks after the site.
- A withdrawal fails → check that Paystack Transfers are on, and that the professional picked a bank from the list (not typed a name).

---

# How to test (before live)

Stay on **Settings → Card payments → Test**. Do not switch to Live until this list passes.

**Test card:** `4084 0840 8408 4081`  
Any future expiry. Any CVV. PIN `0000` if asked.

You need three logins: a family, a verified professional (with bank details saved), and staff. Use three browsers, or log out between each.

## Must pass before live

1. Family sends a hire → pays the meeting fee → staff mark the meeting done → staff send a bill (use a round amount, e.g. ₦70,000).
2. Family pays the bill. Wallet **Held** equals the bill, not double. Request says Birdie is holding the money. Bill badge says **Paid**.
3. Staff click **Start the job**, then **The job is done**. Status is **Job done**. Wallet: Held 0, Waiting = the bill.
4. Staff click **Pay the professional now**. Wallet: Waiting 0, Ready = bill minus 3.5%. Request says the professional has been paid.
5. Professional withdraws the ready amount (if it is above the minimum) → staff approve on Money. Paystack test transfer succeeds, or shows a clear Paystack message.
6. Family can write a review.

## Check once

- Click **The job is done** a second time. Nothing should break.
- On a different hire that is still held (not yet paid out), click **Send the money back**. The family is refunded. The wallet hold is cleared.
- Open **Settings → Money**. Confirm Birdie keeps **3.5%**. The next payout must use 3.5%, not 15%.

## The stuck test hire

Open request **BRD-260815-0002**. Held should be **₦70,000**, not ₦140,000. Click **The job is done**, then **Pay the professional now**. Ready should be **₦67,550**.
