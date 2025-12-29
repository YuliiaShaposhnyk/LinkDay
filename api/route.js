import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // важливо, щоб не Edge

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasKey: !!process.env.RESEND_API_KEY,
  });
}

export async function POST(req) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    const formData = await req.formData();
    const get = (k) => (formData.get(k) ?? "").toString().trim();

    // ⚠️ назви ключів повинні ТОЧНО співпадати з name="" у формі
    const BContactName = get("B-Contact-Name");
    const BEmailAddress = get("B-Email-Address");
    const PartnerOne = get("B-Name-of-Partner-One");
    const PartnerTwo = get("B-Name-of-Partner-Two");

    const WeddingDay = get("B-Date"); // у тебе name="B-Date"
    const CeremonyAddress = get("B-The-Ceremony-Address");
    const SameLocation = get("B-Same-Location"); // чекбокс
    const BanquetAddress = get("banquetAddress");
    const Schedule = get("B-The-Day-s-Schedule");

    const color1 = get("color1");
    const color2 = get("color2");
    const color3 = get("color3");
    const color4 = get("color4");

    // hidden поле: у тебе зараз name="Page URL"
    const pageUrl = get("Page URL");

    await resend.emails.send({
      from: "LinkDay <no-reply@linkday.ca>",
      to: "linkdayweddinginvitation@gmail.com",
      replyTo: BEmailAddress || undefined,
      subject: `NEW Client | Basic Package`,
      text: `
Basic Package | ${pageUrl}

Contact:
- Full Name: ${BContactName}
- Email: ${BEmailAddress}

Newlyweds:
- Partner One: ${PartnerOne}
- Partner Two: ${PartnerTwo}

Wedding Info:
- Wedding Day: ${WeddingDay}
- Ceremony Address: ${CeremonyAddress}
- Same Location: ${SameLocation}
- Banquet Address: ${BanquetAddress}

Schedule:
${Schedule}

Dress code colors:
- ${color1}
- ${color2}
- ${color3}
- ${color4}
      `.trim(),
    });

    return NextResponse.redirect("https://square.link/u/Qd3Nl2Ho", { status: 303 });
  } catch (error) {
    console.error("basic route error:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
