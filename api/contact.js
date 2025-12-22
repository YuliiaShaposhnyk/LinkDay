// api/contact.js

module.exports = async (req, res) => {
  // ==== GET: просто діагностика ====
  if (req.method === 'GET') {
    if (!process.env.RESEND_API_KEY) {
      res.status(500).send('NO RESEND_API_KEY in environment');
    } else {
      res.status(200).send('CONTACT FUNCTION OK, KEY PRESENT');
    }
    return;
  }

  // ==== інші методи, крім POST, забороняємо ====
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      res.status(500).send('NO RESEND_API_KEY in environment');
      return;
    }

    // читаємо тіло форми (urlencoded)
    let body = '';

    await new Promise((resolve, reject) => {
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    const params = new URLSearchParams(body);

    const fullName = params.get('full name') || '';
    const email = params.get('email') || '';
    const message = params.get('message') || '';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // поки що можна так, бо домен підтверджений:
        from: 'no-reply@linkday.ca',
        to: 'linkdayweddinginvitation@gmail.com',
        subject: 'Contact Form LinkDay',
        text: `
        
        Contact:

            Full Name: ${fullName}
            Email: ${email}

            Message:
            ${message}
                    `,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Resend error:', response.status, text);
      // 👇 тепер ми повертаємо ВЕСЬ текст помилки у браузер
      res
        .status(500)
        .send(`Resend error: ${response.status}\n\n${text}`);
      return;
    }

    // успіх → редірект на сторінку подяки
    res.statusCode = 303;
    res.setHeader('Location', '/thank-you.html');
    res.end();
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).send('Internal Server Error');
  }
};
