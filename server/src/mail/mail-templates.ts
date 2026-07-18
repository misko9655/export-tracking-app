function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderInfoRow(label: string, value: string): string {
    return `
        <tr>
            <td style="padding:6px 0;font-size:14px;color:#5b6675;width:160px;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:6px 0;font-size:14px;color:#1a2733;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`;
}

function renderShell(heading: string, bodyHtml: string): string {
    return `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:600px;">
                    <tr>
                        <td style="background-color:#1a3d5c;padding:20px 32px;">
                            <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.3px;">Export Tracking</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;color:#1a3d5c;">${escapeHtml(heading)}</h1>
                            ${bodyHtml}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px;background-color:#f4f6f8;border-top:1px solid #e5e8eb;">
                            <p style="margin:0;font-size:12px;color:#8a94a0;">Ovo je automatska poruka iz sistema za praćenje izvoza. Molimo ne odgovarajte na ovaj email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

export type OrderCreatedInfo = {
    orderName: string;
    customerName: string;
    deliveryDate: Date;
};

export function renderOrderCreatedEmail(order: OrderCreatedInfo): string {
    const deliveryDateStr = order.deliveryDate?.toLocaleDateString?.('sr-Latn') ?? String(order.deliveryDate ?? '');
    const rows = [
        renderInfoRow('Kupac', order.customerName),
        renderInfoRow('Naziv trebovanja', order.orderName),
        renderInfoRow('Datum isporuke', deliveryDateStr),
    ].join('');

    const body = `
            <p style="margin:0 0 16px;font-size:14px;color:#1a2733;">Kreirano je novo trebovanje.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;

    return renderShell('Novo trebovanje', body);
}

export type CommentAddedInfo = {
    orderName: string;
    customerName: string;
    username: string;
    text: string;
};

export function renderCommentAddedEmail(info: CommentAddedInfo): string {
    const rows = [
        renderInfoRow('Kupac', info.customerName),
        renderInfoRow('Trebovanje', info.orderName),
        renderInfoRow('Korisnik', info.username),
    ].join('');

    const body = `
            <p style="margin:0 0 16px;font-size:14px;color:#1a2733;">Dodat je novi komentar na trebovanje.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
            <div style="margin-top:16px;padding:16px;background-color:#f4f6f8;border-left:4px solid #1a3d5c;border-radius:4px;">
                <p style="margin:0;font-size:14px;line-height:1.5;color:#1a2733;white-space:pre-wrap;">${escapeHtml(info.text)}</p>
            </div>`;

    return renderShell('Novi komentar', body);
}
