<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ $topic }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px;">
    <div style="text-align:center;margin-bottom:20px"><img src="{{ \App\Support\EmailBranding::logoUrl() }}" alt="SCKOLARIS" style="width:88px;height:88px;border-radius:18px;display:inline-block" /></div>
    <h2 style="color: #001c40; margin-bottom: 4px;">Nouveau message — formulaire de contact SCKOLARIS</h2>
    <p style="color: #666; font-size: 13px; margin-top: 0;">Institut Universitaire ZTF — bibliothèque numérique</p>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 90px;">Nom</td>
            <td style="padding: 6px 0;">{{ $name }}</td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email</td>
            <td style="padding: 6px 0;"><a href="mailto:{{ $senderEmail }}">{{ $senderEmail }}</a></td>
        </tr>
        <tr>
            <td style="padding: 6px 0; font-weight: bold;">Sujet</td>
            <td style="padding: 6px 0;">{{ $topic }}</td>
        </tr>
    </table>

    <div style="background: #f4f6fb; border-radius: 8px; padding: 16px; white-space: pre-wrap;">{{ $body }}</div>

    <p style="color: #999; font-size: 12px; margin-top: 24px;">
        Répondre directement à ce courriel contactera {{ $name }} à {{ $senderEmail }}.
    </p>
</body>
</html>
