require('dotenv').config();
const { messagingApi } = require('@line/bot-sdk'); // 🔥 ใช้ก้อน messagingApi แทน

// สร้าง client ผ่านฟังก์ชัน MessagingApiClient ของ messagingApi
const client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

const ADMIN_LINE_ID = 'U00dab51de1c5d545e482e746f94c3890';

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
                                uri: `https://liff.line.me/${process.env.LIFF_ID}/dashboard/orders`
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
    }
};



module.exports = LineService;