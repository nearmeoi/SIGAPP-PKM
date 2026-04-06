<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject_text }}</title>
    <style>
        body { margin: 0; padding: 0; background: #f3f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #15325F 0%, #1a4a8a 100%); padding: 32px 40px; text-align: center; }
        .header img { height: 48px; margin-bottom: 12px; }
        .header h1 { color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.7); font-size: 12px; margin: 6px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 40px; }
        .greeting { font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 20px; }
        .content { font-size: 14px; line-height: 1.8; color: #4a5568; white-space: pre-line; margin-bottom: 28px; }
        .info-card { background: #f7fafc; border: 1px solid #e2e8f0; border-left: 4px solid #15325F; border-radius: 8px; padding: 20px; margin-bottom: 28px; }
        .info-card .label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .info-card .value { font-size: 16px; font-weight: 800; color: #15325F; }
        .signature { font-size: 13px; color: #718096; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; }
        .footer { background: #f7fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 11px; color: #a0aec0; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SIGAPPA</h1>
            <p>Sistem Informasi Geospasial dan Akses Pelayanan Pariwisata</p>
        </div>

        <div class="body">
            <div class="greeting">Yth. {{ $recipientName }},</div>

            <div class="info-card">
                <div class="label">Kegiatan PKM</div>
                <div class="value">{{ $judulKegiatan }}</div>
            </div>

            <div class="content">{{ $body_text }}</div>

            <div class="signature">
                Hormat kami,<br>
                <strong>Tim SIGAP PKM</strong><br>
                Politeknik Pariwisata Makassar
            </div>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} SIGAPPA &mdash; Politeknik Pariwisata Makassar. Semua hak dilindungi.</p>
            <p style="margin-top: 6px;">Email ini dikirim secara otomatis. Jangan membalas email ini.</p>
        </div>
    </div>
</body>
</html>
