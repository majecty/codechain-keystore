import { SDK } from "codechain-sdk";
import { ServerConfig } from "./logic/config";
import * as sqlite3 from "sqlite3";
import { initialize as dbInitialize } from "./model/initialize";

let database = sqlite3.Database;
if (process.env.NODE_ENV !== "production") {
    database = sqlite3.verbose().Database;
}

export interface Context {
    codechainSDK: SDK;
    config: ServerConfig;
    db: sqlite3.Database;
}

export async function createContext(): Promise<Context> {
    const config = require("config") as ServerConfig;

    const codechainSDK = new SDK({
        server: config.codechainURL
    });

    const db = await new Promise<sqlite3.Database>((resolve, reject) => {
        const dbFileName = process.env.NODE_ENV === "production" ? "faucet.db" : ":memory:";
        const newDB = new database(dbFileName, (err: Error) => {
            if (err) { reject(err); return; }
            resolve(newDB);
        });
    });

    await dbInitialize(db);

    return {
        codechainSDK,
        config,
        db
    }
}

export async function closeContext(context: Context): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        context.db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
