// WhatsApp par message bhejne ka Master Function
export const sendWhatsAppMessage = (mobile, message) => {
  // India ka code '91' automatically jodna (agar nahi hai toh)
  const formattedMobile = mobile.length === 10 ? `91${mobile}` : mobile;
  const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;
  
  // Mobile par ye direct WhatsApp App khol dega, aur PC par WhatsApp Web
  window.open(whatsappUrl, '_blank');
};

// 1. Naya Order Banne Par (Order Received)
export const sendOrderReceived = (order) => {
  const totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const advance = order.payments?.reduce((sum, pay) => sum + pay.installmentAmount, 0) || 0;
  const pending = totalBill - advance;
  const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('en-IN');
  const garment = order.items[0]?.garmentType || 'Kapde';

  const message = `Namaste ${order.customer.name} ji! 🙏\n\nAapka order Tailor App par book ho gaya hai.\n\n*Bill No:* ${order.orderNumber}\n*Kapda:* ${garment}\n*Delivery Date:* ${deliveryDate}\n\n*Total Bill:* ₹${totalBill}\n*Jama (Advance):* ₹${advance}\n*Baki (Pending):* ₹${pending}\n\nHamari dukan chunne ke liye Dhanyawad! ✂️👕`;
  
  sendWhatsAppMessage(order.customer.mobile, message);
};

// 2. Kapda Sil Jane Par (Order Ready)
export const sendOrderReady = (order) => {
  const totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const advance = order.payments?.reduce((sum, pay) => sum + pay.installmentAmount, 0) || 0;
  const pending = totalBill - advance;
  const garment = order.items[0]?.garmentType || 'Kapde';

  const message = `Khushkhabri ${order.customer.name} ji! 🎉\n\nAapka kapda (*${garment}* - Bill No: ${order.orderNumber}) sil kar ekdum *READY* hai.\n\nKripya apni suvidha anusar dukan se collect kar lein.\n\n*Baki Payment:* ₹${pending}\n\nAapka din shubh ho! 🛍️`;
  
  sendWhatsAppMessage(order.customer.mobile, message);
};

// 3. Delivery Reminder (Agar kapda ready hai par grahak lene nahi aaya)
export const sendDeliveryReminder = (order) => {
  const garment = order.items[0]?.garmentType || 'Kapde';

  const message = `Namaste ${order.customer.name} ji, 🕰️\n\nYad dilane ke liye message kiya hai ki aapka kapda (*${garment}*) dukan par ready rakha hai.\n\nKripya samay nikal kar le jayein. Dhanyawad! 🙏`;
  
  sendWhatsAppMessage(order.customer.mobile, message);
};

// 4. Udhaari Mange Ke Liye (Payment Reminder)
export const sendPaymentReminder = (order) => {
  const totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const advance = order.payments?.reduce((sum, pay) => sum + pay.installmentAmount, 0) || 0;
  const pending = totalBill - advance;

  const message = `Namaste ${order.customer.name} ji, 🙏\n\nAapke pichle order (Bill: ${order.orderNumber}) ki payment abhi baki hai.\n\n*Baki Amount:* ₹${pending}\n\nKripya apna baki payment jaldi clear karein. Aap hume is number par UPI / PhonePe bhi kar sakte hain. Dhanyawad! 💸`;
  
  sendWhatsAppMessage(order.customer.mobile, message);
};