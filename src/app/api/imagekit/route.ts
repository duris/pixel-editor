const ImageKit = require("imagekit");
const fs = require("fs").promises;

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

export async function POST(request: Request) {
  const body = await request.json();
  const path = body.path;

  const buffer = await fs.readFile(`./public/${path}`);

  // Convert the buffer to base64
  const base64 = buffer.toString("base64");

  const res = imagekit.upload({
    file: base64, // required
    fileName: "testing-upload.png", // required
    // tags: ["tag1", "tag2", "tag3"], // Optional: Add custom tags to the uploaded image
    // folder: "/path/to/folder", // Optional: Specify a folder where the image will be uploaded
    // useUniqueFileName: false, // Optional: Set this to true if you want to use a unique filename for each upload
    // responseFields: ["tags"], // Optional: Specify additional fields you want in the response
    // isPrivateFile: false, // Optional: Set this to true if you want the uploaded image to be private
  });

  console.log(res);

  return new Response(JSON.stringify(res));
}
