import { getDb } from "@/app/lib/mongodb";

/**
 * Adds a notification to the queue to be processed in the background.
 */
export async function queueNotification(type, data) {
  try {
    const db = await getDb();
    await db.collection("notification_queue").insertOne({
      type, // 'ORDER_PLACED', 'STATUS_CHANGED'
      data,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Fire and forget: trigger processing immediately in the background
    processQueue().catch(err => console.error("Immediate Process Error:", err));
  } catch (err) {
    console.error("Queue Notification Error:", err);
  }
}

/**
 * Logic for sending SMS via BulkSMSBD
 */
async function sendSms(apiKey, senderId, number, message) {
  if (!apiKey || !number || !message) {
    console.error("SMS Skip: Missing parameters", { number, message: !!message });
    return false;
  }
  try {
    const qs = new URLSearchParams({
      api_key: apiKey,
      type: "text",
      number: number,
      senderid: senderId || "",
      message: message
    });
    
    const url = `http://bulksmsbd.net/api/smsapi?${qs.toString()}`;
    const res = await fetch(url, { method: "GET" });
    const text = await res.text();
    
    // BulkSMSBD returns JSON like {"response_code":202,"success_message":"...", "error_message":"..."}
    try {
      const json = JSON.parse(text);
      if (json.response_code === 202 || json.success_message) return true;
      console.error("SMS API Error Response:", json);
      return false;
    } catch (_e) {
      // If not JSON, check if it's a simple success string or res.ok
      return res.ok;
    }
  } catch (err) {
    console.error("SMS Network Error:", err);
    return false;
  }
}

/**
 * Processes the notification queue.
 */
export async function processQueue() {
  const db = await getDb();
  const settings = await db.collection("settings").findOne({ _id: "store" });
  
  if (!settings?.sms?.isEnabled) return;

  const pending = await db.collection("notification_queue")
    .find({ status: 'pending', attempts: { $lt: 5 } })
    .limit(10)
    .toArray();

  if (pending.length === 0) return;

  for (const job of pending) {
    let jobSuccess = true;
    const { type, data } = job;

    try {
      if (type === 'ORDER_PLACED') {
        // 1. Notify Admin
        if (settings.sms.adminNumber) {
          const adminMsg = `New Order: ${data.orderNumber}. Total: ৳${data.total}. Customer: ${data.customerName} (${data.customerPhone})`;
          const ok = await sendSms(settings.sms.apiKey, settings.sms.senderId, settings.sms.adminNumber, adminMsg);
          if (!ok) jobSuccess = false;
        }
        
        // 2. Notify Customer
        if (data.customerPhone) {
          const customerMsg = `Dear ${data.customerName}, your order ${data.orderNumber} has been placed successfully. Total: ৳${data.total}. Thank you! https://instylebyshifa.bd/`;
          const ok = await sendSms(settings.sms.apiKey, settings.sms.senderId, data.customerPhone, customerMsg);
          if (!ok) jobSuccess = false;
        }
      }

      if (type === 'STATUS_CHANGED') {
        if (data.customerPhone) {
          const statusMsg = `Dear ${data.customerName}, your order ${data.orderNumber} status is now: ${data.newStatus}. https://instylebyshifa.bd/`;
          const ok = await sendSms(settings.sms.apiKey, settings.sms.senderId, data.customerPhone, statusMsg);
          if (!ok) jobSuccess = false;
        }
      }
    } catch (err) {
      console.error("Job Exception:", err);
      jobSuccess = false;
    }

    await db.collection("notification_queue").updateOne(
      { _id: job._id },
      { 
        $set: { 
          status: jobSuccess ? 'completed' : 'pending',
          updatedAt: new Date() 
        },
        $inc: { attempts: 1 }
      }
    );
  }
}
