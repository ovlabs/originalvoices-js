import { Command } from "commander";
import { setJsonMode } from "./output.js";
import { registerAskCommand } from "./commands/ask.js";
import { registerAuthCommand } from "./commands/auth.js";
import { registerAudiencesCommand } from "./commands/audiences.js";
import { registerStudiesCommand } from "./commands/studies.js";

const program = new Command();

program
  .name("ov")
  .description("CLI for the OriginalVoices API")
  .version("2.0.0")
  .option("--json", "Output raw JSON (for scripting)")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.json) setJsonMode(true);
  });

registerAuthCommand(program);
registerAskCommand(program);
registerAudiencesCommand(program);
registerStudiesCommand(program);

program.parse();
