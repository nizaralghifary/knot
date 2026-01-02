import "dotenv/config";
import crypto from "crypto";
import { db } from "@/lib/db/drizzle";
import { apiKeys } from "@/lib/db/schema";

function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

async function generate() {
    const rawToken = generateToken();

    const token = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    await db.insert(apiKeys).values({
        name: "internal-use",
        token,
        is_active: true
    });

    console.log("API TOKEN (SAVE THIS ONCE):");
    console.log(rawToken);
    console.log("TOKEN CANNOT BE RETRIEVED FROM DATABASE");
}

generate().catch((error) => {
    console.error(error);
    process.exit(1);
});