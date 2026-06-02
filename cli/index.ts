#!/usr/bin/env node

import prompts from "prompts";
import degit from "degit";
import path from "path";
import fs from "fs";
import pc from "picocolors";

const TEMPLATE_REPO = "khalifaalhasan/repo-taker-porfolio"; // This is your repo!

async function main() {
  console.log(pc.cyan("✨ Welcome to the Zero-DB Portfolio CLI! ✨\n"));

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "What is your project named?",
      initial: "my-portfolio",
    },
    {
      type: "text",
      name: "githubUsername",
      message: "What is your GitHub Username?",
      validate: (value) => (value.length > 0 ? true : "Username is required!"),
    },

    {
      type: "text",
      name: "githubOrgs",
      message:
        "Do you want to fetch repos from any specific GitHub Organizations? (comma-separated, leave blank for none)",
      initial: "",
    },
    {
      type: "select",
      name: "theme",
      message: "Choose a default UI Theme",
      choices: [
        { title: "Default Dark", value: "dark" },
        { title: "Ocean Blue", value: "ocean" },
        { title: "Forest Green", value: "forest" },
      ],
    },
  ]);

  if (!response.projectName) {
    console.log(pc.red("Setup cancelled."));
    process.exit(1);
  }

  const projectDir = path.resolve(process.cwd(), response.projectName);

  console.log(
    pc.blue(
      `\n📥 Downloading template from ${TEMPLATE_REPO} into ${response.projectName}...`,
    ),
  );

  try {
    const emitter = degit(TEMPLATE_REPO, {
      cache: false,
      force: true,
      verbose: true,
    });

    await emitter.clone(projectDir);

    console.log(pc.green("✅ Template downloaded successfully!\n"));

    // 1. Write the .env file
    console.log(pc.blue("⚙️  Configuring environment variables..."));
    const envContent = `NEXT_PUBLIC_GITHUB_USERNAME=${response.githubUsername}

# ==============================================================================
# GITHUB PERSONAL ACCESS TOKEN (PAT)
# ==============================================================================
# Follow these steps to create one:
# 1. Go to https://github.com/settings/tokens
# 2. Click 'Generate new token (classic)'
# 3. Set Expiration: 
#    - 'No expiration': Recommended so your site never breaks.
#    - '1 Year': Better security, but you MUST regenerate it yearly.
# 4. Check the following scopes:
#    - [x] repo (Full control of private repositories)
#    - [x] read:user (Read all user profile data)
# ==============================================================================
GITHUB_PAT=""

GITHUB_ORGS=${response.githubOrgs}
`;
    fs.writeFileSync(path.join(projectDir, ".env"), envContent);

    // 2. Inject Theme into globals.css (Simple substitution for demo purposes)
    console.log(pc.blue(`🎨 Applying ${response.theme} theme...`));
    const globalsCssPath = path.join(projectDir, "src/app/globals.css");
    if (fs.existsSync(globalsCssPath)) {
      let cssContent = fs.readFileSync(globalsCssPath, "utf-8");

      if (response.theme === "ocean") {
        cssContent = cssContent.replace(
          /--background: 0 0% 100%;/g,
          "--background: 210 50% 98%;",
        );
        cssContent = cssContent.replace(
          /--background: 0 0% 3\.9%;/g,
          "--background: 222 47% 11%;",
        );
        cssContent = cssContent.replace(
          /--primary: 0 0% 9%;/g,
          "--primary: 221 83% 53%;",
        );
        cssContent = cssContent.replace(
          /--primary: 0 0% 98%;/g,
          "--primary: 210 40% 98%;",
        );
      } else if (response.theme === "forest") {
        cssContent = cssContent.replace(
          /--background: 0 0% 100%;/g,
          "--background: 140 30% 98%;",
        );
        cssContent = cssContent.replace(
          /--background: 0 0% 3\.9%;/g,
          "--background: 140 40% 10%;",
        );
        cssContent = cssContent.replace(
          /--primary: 0 0% 9%;/g,
          "--primary: 142 71% 45%;",
        );
        cssContent = cssContent.replace(
          /--primary: 0 0% 98%;/g,
          "--primary: 140 40% 98%;",
        );
      }

      fs.writeFileSync(globalsCssPath, cssContent);
    }

    console.log(pc.green("\n🎉 All set! Your Zero-DB Portfolio is ready."));
    console.log(pc.yellow("\n⚠️  IMPORTANT NEXT STEP:"));
    console.log(
      pc.white(`Open the `) + pc.cyan(`${response.projectName}/.env`) + pc.white(` file and add your GitHub PAT:\n`) +
      pc.gray("  1. Go to https://github.com/settings/tokens\n") +
      pc.gray("  2. Generate a new classic token with 'repo' and 'read:user' scopes\n") +
      pc.gray("  3. Set GITHUB_PAT=\"ghp_your_token\" inside the .env file")
    );
    
    console.log(
      `\nTo start the dev server:\n  cd ${response.projectName}\n  npm install\n  npm run dev\n`,
    );

    process.exit(0);
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error setting up project: ${error.message}`));
    console.error(
      pc.gray(
        "Make sure your template repository is public or you have the correct Git permissions.",
      ),
    );
    process.exit(1);
  }
}

main().catch(console.error);
