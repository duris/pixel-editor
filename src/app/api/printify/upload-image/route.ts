import { NextResponse } from "next/server";

type PrintifyShop = {
  id: number;
  title: string;
  sales_channel: string;
};

type PrintifyShops = {
  shops: PrintifyShop[];
};

export async function POST(request: Request) {
  const body = await request.json();
  const token = process.env.PRINTIFY_API;
  const bearer = "Bearer " + token;
  const apiUrl = `https://api.printify.com/v1/uploads/images.json`;

  const res = await fetch(apiUrl, {
    method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {
      Authorization: bearer,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "NodeJS",
    },
    body: JSON.stringify({
      file_name: body.file_name,
      url: body.url,
    }),
  });

  const data = await res.json();
  console.log(data);

  return new Response(JSON.stringify(data));
}
