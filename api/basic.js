// api/basic.js

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

    const BContactName = params.get('B-Contact-Name') || '';
    const BEmailAddress = params.get('B-Email-Address') || '';
    const BNameofPartnerOne = params.get('B-Name-of-Partner-One') || '';
    const BNameofPartnerTwo = params.get('B-Name-of-Partner-Two') || '';
    const WeddingDay = params.get('B-Date') || '';
    const BTheCeremonyAddress = params.get('B-The-Ceremony-Address') || '';
    const BSameLocation = params.get('B-Same-Location') || '';
    const banquetAddress = params.get('banquetAddress') || '';
    const BTheDaysSchedule = params.get('B-The-Day-s-Schedule') || '';
    const color1 = params.get('color1') || '';
    const color2 = params.get('color2') || '';
    const color3 = params.get('color3') || '';
    const color4 = params.get('color4') || '';
    const pathurl = formData.get("page-url") || formData.get("Page URL") || "";

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
        subject: 'NEW Client | Basic Package ',
        text: `
        
        Basic Package | ${pathurl}

            Contact Persone:
            B | Contact Name: ${BContactName}
            B | Email Address: ${BEmailAddress}

            Newlyweds:
            B | Name of Partner One: ${BNameofPartnerOne}
            B | Name of Partner Two: ${BNameofPartnerTwo}

            Wedding Info:
            B | Wedding Day: ${WeddingDay}
            B | Thw Ceremony Address: ${BTheCeremonyAddress}
            B | Same Location: ${BSameLocation}
            B | Banquet Address: ${banquetAddress}
            B | The Day's Shedule: 
                ${BTheDaysSchedule}

            Dress Code:
            B | Color 1: ${color1}
            B | Color 2: ${color2}
            B | Color 3: ${color3}
            B | Color 4: ${color4}            
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
    res.setHeader('Location', 'https://square.link/u/Qd3Nl2Ho');
    res.end();
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).send('Internal Server Error');
  }
};
