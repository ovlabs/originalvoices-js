import { Command } from "commander";
import * as client from "../client.js";
import { isJsonMode, printError, printJson, printTable } from "../output.js";

export function registerStudiesCommand(program: Command): void {
  const studies = program
    .command("studies")
    .description("List studies you can ask with `ov ask --study`");

  studies
    .command("list")
    .description("List finished studies")
    .action(async () => {
      try {
        const res = await client.listStudies();
        if (isJsonMode()) return printJson(res);

        if (res.length === 0) {
          console.log("No finished studies.");
          return;
        }

        printTable(
          ["ID", "Title", "Kind", "Participants"],
          res.map((s) => [s.id, s.title, s.kind, String(s.participants)])
        );
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) return printJson({ error: err.code, message: err.message });
          printError(`${err.message} (${err.code})`);
          process.exit(1);
        }
        throw err;
      }
    });
}
