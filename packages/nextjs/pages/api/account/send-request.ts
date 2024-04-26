import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log("req.body", req.body);
    // TODO use Defender Relayer to upDevAccountNFT.sendRequest via UP relayer execution flow
    return NextResponse.json({ });
}
