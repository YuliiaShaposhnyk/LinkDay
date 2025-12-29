// /api/basic.js

export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req, res) {
  try {
    // GET: діагностика
    if (req.method === "GET") {
      if (!process.env.RESEND_API_KEY) {
        return res.status(500).send("NO RESEND_API_KEY in environment");
      }
      return res.status(200).send("BASIC FUNCTION OK, KEY PRESENT");
    }

    // тільки POST
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).send("NO RESEND_API_KEY in environment");
    }

    // читаємо raw body (працює для application/x-www-form-urlencoded)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");

    const params = new URLSearchParams(body);

    const BContactName = params.get("B-Contact-Name") || "";
    const BEmailAddress = params.get("B-Email-Address") || "";
    const BNameofPartnerOne = params.get("B-Name-of-Partner-One") || "";
    const BNameofPartnerTwo = params.get("B-Name-of-Partner-Two") || "";
    const WeddingDay = params.get("B-Date") || ""; // ✅ у тебе name="B-Date"
    const BTheCeremonyAddress = params.get("B-The-Ceremony-Address") || "";
    const BSameLocation = params.get("B-Same-Location") ? "Yes" : "No";
    const banquetAddress = params.get("banquetAddress") || "";
    const BTheDaysSchedule = params.get("B-The-Day-s-Schedule") || "";
    const color1 = params.get("color1") || "";
    const color2 = params.get("color2") || "";
    const color3 = params.get("color3") || "";
    const color4 = params.get("color4") || "";
    const pathurl = params.get("page-url") || "";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "no-reply@linkday.ca",
        to: "linkdayweddinginvitation@gmail.com",
        subject: "NEW Client | Basic Package",
        text: `Basic Package | ${pathurl}

Contact:
- Full Name: ${BContactName}
- Email: ${BEmailAddress}

Newlyweds:
- Partner One: ${BNameofPartnerOne}
- Partner Two: ${BNameofPartnerTwo}

Wedding Info:
- Wedding Day: ${WeddingDay}
- Ceremony Address: ${BTheCeremonyAddress}
- Same Location: ${BSameLocation}
- Banquet Address: ${banquetAddress}

Schedule:
${BTheDaysSchedule}

Dress Code:
- Color 1: ${color1}
- Color 2: ${color2}
- Color 3: ${color3}
- Color 4: ${color4}
`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).send(`Resend error: ${response.status}\n\n${text}`);
    }

    // успіх → редірект на Square
    res.status(303).setHeader("Location", "https://square.link/u/Qd3Nl2Ho");
    return res.end();
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
