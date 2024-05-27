import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/indexer")) {
    const providedSignature = req.headers.get("x-signature");
    if (!providedSignature) {
      throw new Error("Signature not provided");
    }
    const body = await req.json();
    const generatedSignature = ethers.utils.keccak256(JSON.stringify(body) + process.env.MORALIS_STREAMS_SECRET);
    if (generatedSignature != providedSignature) {
      console.log("Unauthorized", generatedSignature, providedSignature, body);
      return new Response("Unauthorized", { status: 401 });
    }
    if (body.confirmed) {
      return NextResponse.json(
        {},
        {
          status: 200,
        },
      );
    }
  }
  return NextResponse.next();
}
