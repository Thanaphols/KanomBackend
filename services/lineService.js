require('dotenv').config();

const { messagingApi } = require('@line/bot-sdk');

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const conn = require('../db')

const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

const ADMIN_LINE_ID = 'U00dab51de1c5d545e482e746f94c3890';

const sendReply = async (replyToken, text) => {
    try {
        await axios.post('https://api.line.me/v2/bot/message/reply', {
            replyToken: replyToken,
            messages: [{ type: 'text', text: text }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });
    } catch (err) {
        console.error("Reply Error:", err.response?.data || err);
    }
};

const downloadLineImage = async (messageId, fileName) => {
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
    const filePath = path.join(__dirname, '../uploads/slips', fileName);

    console.log("📂 กำลังเซฟไฟล์ไปที่:", filePath); // ดูว่า Path ถูกไหม

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', () => {
                console.log("✅ โหลดรูปสำเร็จ:", fileName);
                resolve();
            });
            writer.on('error', (err) => {
                console.error("❌ เขียนไฟล์ไม่สำเร็จ:", err);
                reject(err);
            });
        });
    } catch (error) {
        console.error("❌ ดึงรูปจาก LINE ไม่ได้:", error.response?.data || error.message);
        throw error;
    }
};

const LineService = {
    sendOrderConfirmation: async (u_line_id, orderData) => {
        const message = {
            type: 'flex',
            altText: 'สรุปรายการสั่งซื้อจากร้านฟาร์มขนม',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        { type: 'text', text: '📦 สั่งซื้อสำเร็จ!', weight: 'bold', size: 'xl', color: '#1DB446' },
                        { type: 'separator', margin: 'md' },
                        {
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            contents: [
                                { type: 'text', text: `คุณ: ${orderData.userName}`, size: 'sm', color: '#555555' },
                                { type: 'text', text: `รายการ: ${orderData.itemsSummary}`, size: 'sm', margin: 'xs', wrap: true },
                                { type: 'text', text: `ยอดรวมทั้งสิ้น: ${orderData.totalPrice} บาท`, weight: 'bold', size: 'md', margin: 'sm', color: '#000000' }
                            ]
                        },
                        { type: 'text', text: 'ขอบคุณที่อุดหนุนครับ เราจะรีบจัดส่งให้เร็วที่สุด', size: 'xs', color: '#aaaaaa', margin: 'lg', wrap: true }
                    ]
                }
            }
        };

        try {
            await client.pushMessage({
                to: u_line_id, // ใช้ค่า u_line_id ที่พี่เก็บไว้ใน DB
                messages: [message]
            });
            return { success: true };
        } catch (err) {
            // ดึง Error ออกมาดูให้ละเอียดถ้าส่งไม่สำเร็จ
            console.error("LINE Service Error details:", err.response ? err.response.data : err);
            return { success: false, error: err };
        }
    },

    sendDeliveryUpdate: async (u_line_id, deliveryData) => {
        const message = {
            type: 'flex',
            altText: 'อัปเดตสถานะการจัดส่งจากร้านฟาร์มขนม',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        { type: 'text', text: '🚚 คอนเฟิร์มวันส่งขนม!', weight: 'bold', size: 'xl', color: '#007bff' },
                        { type: 'separator', margin: 'md' },
                        {
                            type: 'box',
                            layout: 'vertical',
                            margin: 'md',
                            contents: [
                                { type: 'text', text: `เลขออเดอร์: #${deliveryData.o_ID}`, size: 'xs', color: '#aaaaaa' },
                                { type: 'text', text: `กำหนดส่ง: ${deliveryData.o_endDate}`, weight: 'bold', size: 'lg', color: '#cc0000', margin: 'sm' },
                                { type: 'text', text: 'เตรียมรอรับความอร่อยได้เลยครับ!', size: 'sm', margin: 'md', wrap: true }
                            ]
                        },

                    ]
                }
            }
        };

        try {
            await client.pushMessage({
                to: u_line_id,
                messages: [message]
            });
            return { success: true };
        } catch (err) {
            console.error("LINE Delivery Update Error:", err);
            return { success: false };
        }
    },

    sendOrderSuccess: async (u_line_id, o_ID) => {
        const message = {
            type: 'flex',
            altText: 'จัดส่งขนมเรียบร้อยแล้ว!',
            contents: {
                type: 'bubble',
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        { type: 'text', text: '✅ จัดส่งสำเร็จ!', weight: 'bold', size: 'xl', color: '#1DB446' },
                        { type: 'text', text: `ออเดอร์ #${o_ID} ของคุณส่งเรียบร้อยแล้ว`, size: 'sm', margin: 'md', color: '#555555' },
                        { type: 'separator', margin: 'lg' },
                        { type: 'text', text: 'หวังว่าคุณจะมีความสุขกับขนมของเรานะครับ หากทานแล้วชอบ อย่าลืมมารีวิวให้ฟังบ้างนะ 🙏', size: 'xs', color: '#aaaaaa', margin: 'lg', wrap: true }
                    ]
                }
            }
        };

        try {
            await client.pushMessage({
                to: u_line_id,
                messages: [message]
            });
            return { success: true };
        } catch (err) {
            console.error("LINE Success Notification Error:", err);
            return { success: false };
        }
    },

    notifyAdminNewOrder: async (orderData) => {
        const message = {
            type: 'flex',
            altText: '🔔 มีออเดอร์ใหม่เข้ามา!',
            contents: {
                type: 'bubble',
                styles: { header: { backgroundColor: '#FF5722' } }, // สีส้มเด่นๆ ให้แอดมินรู้ตัว
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [{ type: 'text', text: '🔔 มีออเดอร์ใหม่!', weight: 'bold', color: '#ffffff', size: 'lg' }]
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        { type: 'text', text: `ลูกค้า: ${orderData.userName}`, weight: 'bold', size: 'sm' },
                        { type: 'text', text: `รายการ: ${orderData.itemsSummary}`, size: 'xs', color: '#666666', margin: 'md', wrap: true },
                        { type: 'text', text: `ยอดรวม: ${orderData.totalPrice} บาท`, weight: 'bold', size: 'md', margin: 'md', color: '#000000' },
                        { type: 'separator', margin: 'lg' },
                        {
                            type: 'button',
                            action: {
                                type: 'uri',
                                label: 'จัดการออเดอร์ในเว็บ',
                                uri: `https://www.baanfarmkhanom.shop/admin/orders`
                            },
                            style: 'primary',
                            color: '#FF5722',
                            margin: 'lg'
                        }
                    ]
                }
            }
        };

        try {
            await client.pushMessage({
                to: ADMIN_LINE_ID, // ส่งหาแอดมินโดยตรง
                messages: [message]
            });
            return { success: true };
        } catch (err) {
            console.error("Notify Admin Error:", err);
            return { success: false };
        }
    },

    handleWebhook: async (req, res) => {
        const events = req.body.events;
        console.log("📩 มี Event เข้ามา:", events?.length); // เช็กว่ามีข้อมูลเข้าไหม

        for (let event of events) {
            console.log("🔎 ประเภท Event:", event.type);

            if (event.type === 'message' && event.message.type === 'image') {
                const line_id = event.source.userId;
                console.log("📸 ได้รับรูปภาพจาก LINE ID:", line_id);

                try {
                    const [orders] = await conn.query(
                        `SELECT o_ID FROM orders o 
                     JOIN users u ON o.u_ID = u.u_ID 
                     WHERE u.u_line_id = ? AND o.o_deposit_status = 1 
                     ORDER BY o.o_date DESC LIMIT 1`,
                        [line_id]
                    );

                    console.log("📦 ผลการหาออเดอร์ใน DB:", orders.length, "รายการ");

                    if (orders.length > 0) {
                        const o_ID = orders[0].o_ID;
                        if (orders.o_deposit_status >= 2) {
                            console.log("🚫 ออเดอร์นี้มีสลิปแล้ว หรือตรวจสอบเสร็จแล้ว ข้ามการโหลดรูป");
                            return;
                        }
                        const messageId = event.message.id;
                        const fileName = `slip_${o_ID}_${Date.now()}.jpg`;

                        console.log("🚀 กำลังเริ่มโหลดรูป...");

                        // ✅ 1. เรียกใช้ฟังก์ชันดาวน์โหลดรูป
                        await downloadLineImage(messageId, fileName);

                        // ✅ 2. อัปเดต Database: ใส่ชื่อไฟล์สลิป และเปลี่ยนสถานะเป็น 2 (รอตรวจ)
                        await conn.query(
                            "UPDATE orders SET o_deposit_slip = ?, o_deposit_status = 2 WHERE o_ID = ?",
                            [fileName, o_ID]


                        );

                        console.log(`✅ อัปเดตออเดอร์ #${o_ID} สำเร็จ!`);

                        // ✅ 3. ส่งข้อความตอบกลับลูกค้า
                        await sendReply(event.replyToken, "ได้รับสลิปมัดจำแล้วค่ะ รอแอดมินตรวจสอบสักครู่นะคะ ✨");

                    } else {
                        console.log("⚠️ ไม่พบออเดอร์ที่รอโอนมัดจำ (Status 1) สำหรับ User นี้");
                    }
                } catch (error) {
                    console.error("❌ Webhook Logic Error:", error);
                }
            }
        }
        res.sendStatus(200);
    },

    sendDepositRequest: async (u_line_id, depositData) => {
        // กำหนดข้อความตามสถานการณ์
        const headerTitle = depositData.isReject ? '❌ สลิปไม่ถูกต้อง' : '💰 แจ้งยอดมัดจำ';
        const headerColor = depositData.isReject ? '#FF5252' : '#FFC107';
        const noticeText = depositData.isReject
            ? 'รูปสลิปที่ส่งมาไม่ถูกต้อง/สลิปปลอม กรุณาตรวจสอบและโอนใหม่อีกครั้งค่ะ'
            : 'ออเดอร์ได้รับการยืนยันแล้ว รบกวนชำระมัดจำเพื่อลงคิวจัดส่งนะคะ';
        const message = {
            type: 'flex',
            altText: depositData.isReject ? 'สลิปมัดจำไม่ถูกต้อง' : 'แจ้งยอดมัดจำจากร้านฟาร์มขนม',
            contents: {
                type: 'bubble',
                styles: { header: { backgroundColor: headerColor } },
                header: {
                    type: 'box', layout: 'vertical',
                    contents: [{ type: 'text', text: headerTitle, weight: 'bold', color: '#FFFFFF', size: 'lg' }]
                },
                body: {
                    type: 'box', layout: 'vertical',
                    contents: [
                        { type: 'text', text: `ออเดอร์ #${depositData.o_ID}`, size: 'xs', color: '#aaaaaa' },
                        { type: 'text', text: noticeText, margin: 'md', size: 'sm', wrap: true, color: depositData.isReject ? '#cc0000' : '#000000', weight: depositData.isReject ? 'bold' : 'regular' },
                        { type: 'separator', margin: 'md' },
                        { type: 'text', text: `ยอดมัดจำที่ต้องโอน:`, margin: 'md', size: 'sm' },
                        { type: 'text', text: `${depositData.amount.toLocaleString()} บาท`, weight: 'bold', size: 'xxl', color: '#cc0000' },
                        { type: 'separator', margin: 'lg' },
                        { type: 'text', text: '🏦 พร้อมเพย์', size: 'sm', margin: 'md', weight: 'bold' },
                        { type: 'text', text: 'เลขบัญชี: 0926166623', size: 'md' },
                        { type: 'text', text: 'ชื่อบัญชี: นายวชิรวิทย์ ชื่นจิตร', size: 'sm' },
                        { type: 'text', text: '* หากมีข้อสงสัยสามารถสอบถามแอดมินได้ทันทีค่ะ', size: 'xs', color: '#aaaaaa', margin: 'lg', wrap: true }
                    ]
                }
            }
        };

        try {
            await client.pushMessage({
                to: u_line_id,
                messages: [message]
            });
            return { success: true };
        } catch (err) {
            console.error("LINE Deposit Request Error:", err);
            return { success: false };
        }
    },
};


module.exports = LineService;