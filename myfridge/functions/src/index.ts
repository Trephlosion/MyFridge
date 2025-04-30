import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import { OpenAI } from "openai";

const Busboy = require("busboy");
admin.initializeApp();

const openai = new OpenAI({
    apiKey: functions.config().openai.key,
});

const corsHandler = cors({ origin: "http://localhost:5173" });

export const generateRecipeFromImage = functions
    .runWith({ memory: "1GB", timeoutSeconds: 60 })
    .https.onRequest((req, res) => {
        return corsHandler(req, res, async () => {
            if (req.method !== "POST") {
                res.set("Access-Control-Allow-Origin", "http://localhost:5173");
                return res.status(405).send("Method Not Allowed");
            }

            try {
                const buffer = await new Promise<Buffer>((resolve, reject) => {
                    const busboy = new Busboy({ headers: req.headers });
                    const fileBuffer: Buffer[] = [];

                    busboy.on("file", (_fieldname: string, file: any) => {
                        file.on("data", (data: Buffer) => fileBuffer.push(data));
                    });

                    busboy.on("finish", () => resolve(Buffer.concat(fileBuffer)));
                    busboy.on("error", reject);

                    req.pipe(busboy);
                });

                const base64Image = buffer.toString("base64");

                const visionPrompt = [
                    {
                        type: "text",
                        text: "Describe this image and generate a recipe with title, description, ingredients, and instructions.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                        },
                    },
                ] as any;

                const response = await openai.chat.completions.create({
                    model: "gpt-4-vision-preview",
                    messages: [{ role: "user", content: visionPrompt }],
                    max_tokens: 1000,
                });

                const raw = response.choices?.[0]?.message?.content || "";
                const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

                const title = lines.find((l) => l.toLowerCase().startsWith("title:"))?.replace(/^title:\s*/i, "") || "AI Recipe";
                const description = lines.find((l) => l.toLowerCase().startsWith("description:"))?.replace(/^description:\s*/i, "") || "Generated from image";
                const ingredients = lines.filter((l) => l.startsWith("-"));
                const instructions = lines.filter((l) => /^\d+\./.test(l));

                const recipe = {
                    title,
                    description,
                    ingredients,
                    instructions,
                    tags: ["AI", "ImageBased"],
                    createdAt: new Date().toISOString(),
                };

                res.set("Access-Control-Allow-Origin", "http://localhost:5173");
                return res.status(200).json({ recipe });
            } catch (error) {
                console.error("Error:", error);
                res.set("Access-Control-Allow-Origin", "http://localhost:5173");
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    });
