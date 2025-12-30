// api/premium.js

module.exports = async (req, res) => {
  // === GET: діагностика ===
  if (req.method === "GET") {
    if (!process.env.RESEND_API_KEY) {
      res.status(500).send("NO RESEND_API_KEY in environment");
    } else {
      res.status(200).send("PREMIUM FUNCTION OK, KEY PRESENT");
    }
    return;
  }

  // === дозволяємо тільки POST ===
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      res.status(500).send("NO RESEND_API_KEY in environment");
      return;
    }

    // читаємо urlencoded body
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const params = new URLSearchParams(body);

    // --- meta ---
    const pageUrl = params.get("page-url") || "";
    const templateName = params.get("templateName") || "";

    // --- Premium fields (P-...) ---
    const PContactName = params.get("P-Contact-Name") || "";
    const PEmailAddress = params.get("P-Email-Address") || "";

    const PPartnerOne = params.get("P-Name-of-Partner-One") || "";
    const PPartnerTwo = params.get("P-Name-of-Partner-Two") || "";

    const PDate = params.get("P-Date") || "";
    const PCeremonyAddress = params.get("P-The-Ceremony-Address") || "";

    // checkbox: якщо unchecked — буде null
    const PSameLocation = params.get("P-Same-Location") ? "Yes" : "No";

    const banquetAddress = params.get("banquetAddress") || "";
    const PSchedule = params.get("P-The-Day-s-Schedule") || "";

    const color1 = params.get("color1") || "";
    const color2 = params.get("color2") || "";
    const color3 = params.get("color3") || "";
    const color4 = params.get("color4") || "";

    const POurStory = params.get("P-Our-Story") || "";

    // --- guests 1..50 ---
    const guests = [];
    for (let i = 1; i <= 50; i++) {
      const val = (params.get(`guests-${i}`) || "").trim();
      if (val) guests.push(`${i < 10 ? "0" + i : i}. ${val}`);
    }

    const emailText = `
Premium Package | ${templateName}

Page: ${pageUrl}

Contact:
- Full Name: ${PContactName}
- Email: ${PEmailAddress}

Newlyweds:
- Partner One: ${PPartnerOne}
- Partner Two: ${PPartnerTwo}

Wedding Info:
- Wedding Day: ${PDate}
- Ceremony Address: ${PCeremonyAddress}
- Same Location: ${PSameLocation}
- Banquet Address: ${banquetAddress}

Schedule:
${PSchedule}

Dress Code:
- Color 1: ${color1}
- Color 2: ${color2}
- Color 3: ${color3}
- Color 4: ${color4}

Our Story:
${POurStory}

Guest List (${guests.length}):
${guests.length ? guests.join("\n") : "(no guests provided)"}
`.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@linkday.ca",
        to: "linkdayweddinginvitation@gmail.com",
        subject: `NEW Client | Premium Package | ${templateName || "Unknown template"}`,
        text: emailText,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Resend error:", response.status, text);
      res.status(500).send(`Resend error: ${response.status}\n\n${text}`);
      return;
    }

    // успіх → редірект на оплату Premium
    res.statusCode = 303;
    res.setHeader("Location", "https://square.link/u/vL74Osk5");
    res.end();
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// ✅ важливо для Vercel (щоб не впасти з runtime)
module.exports.config = {
  runtime: "nodejs",
};
