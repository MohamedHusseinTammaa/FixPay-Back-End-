    import nodemailer  from "nodemailer"
    export const sendEmail=async({to,cc,subject,content,attachments=[]})=>{
    const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 465,
    secure: true, // true for 465, false for other ports
    service:"gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
    },
    });
    (async () => {
    const info = await transporter.sendMail({
        from:`FixPay <${process.env.USER_EMAIL}>`,
        to,
        cc,
        subject,
        html: content,
        attachments
        
    });

    })();
    }

import { EventEmitter } from "node:events";
export const localEmmiter=new EventEmitter()
localEmmiter.on('sendEmail',(args)=>{
console.log("sending Email event is starting");
sendEmail(args)
})

export function htmlOtpTemp(otp){
   return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رمز التحقق الخاص بك</title>
    <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <style>
        /* إعدادات افتراضية */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F7F3E8; }
        
        /* لإصلاح مشاكل العرض في Outlook */
        .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #F7F3E8; font-family: Arial, sans-serif;">

    <!-- جملة مخفية تظهر كمعاينة في الإيميل -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        هذا هو رمز التحقق الخاص بك.
    </div>

    <!-- الحاوية الرئيسية للإيميل -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="background-color: #F7F3E8; padding: 20px;">
                
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                
                <!-- البطاقة البيضاء للمحتوى -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                    
                    <!-- 1. الهيدر (الشعار) -->
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px 20px; background-color: #225740;">
                            <!-- يمكنك استبدال النص بصورة لوجو إذا أردت -->
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; font-family: 'Inter', Arial, sans-serif; letter-spacing: 1px;">
                                FIXPAY
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- 2. المحتوى الرئيسي -->
                    <tr>
                        <td align="center" style="padding: 40px 30px 30px 30px; background-color: #ffffff;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- العنوان -->
                                <tr>
                                    <td align="center" style="font-family: 'Inter', Arial, sans-serif; font-size: 24px; font-weight: bold; color: #111827; padding-bottom: 20px;">
                                        رمز التحقق الخاص بك
                                    </td>
                                </tr>
                                <!-- نص الرسالة -->
                                <tr>
                                    <td align="center" style="font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #4B5563; padding-bottom: 30px;">
                                        مرحباً،<br>
                                        لاستكمال عمليتك، الرجاء استخدام رمز التحقق التالي:
                                    </td>
                                </tr>
                                <!-- كود الـ OTP -->
                                <tr>
                                    <td align="center">
                                        <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px 30px; display: inline-block;">
                                            <p style="margin: 0; color: #225740; font-size: 36px; font-weight: bold; font-family: 'Inter', Arial, sans-serif; letter-spacing: 5px;">
                                                <!-- الكود الفعلي يوضع هنا -->
                                                ${otp}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                <!-- مدة صلاحية الكود -->
                                <tr>
                                    <td align="center" style="padding-top: 30px; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #4B5563;">
                                        هذا الرمز صالح لمدة <span style="font-weight: bold; color: #111827;">10 دقائق</span>.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- 3. الفوتر (تذييل الرسالة) -->
                    <tr>
                        <td align="center" style="padding: 30px 30px 40px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <!-- رسالة أمان -->
                                <tr>
                                    <td align="center" style="font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #6b7280; padding-bottom: 10px;">
                                        إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
                                    </td>
                                </tr>
                                <!-- الحقوق -->
                                <tr>
                                    <td align="center" style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #6b7280;">
                                        &copy; 2025 FIXPAY. جميع الحقوق محفوظة.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    
</body>
</html>
`}