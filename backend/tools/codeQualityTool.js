const { ESLint } = require("eslint");

async function checkCodeQuality(code) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      rules: {
        "no-undef": "error",
        "no-unused-vars": "warn",
        "no-unreachable": "warn"
      }
    }
  });

  const [result] = await eslint.lintText(code, {
    filePath: "ai-input.js"
  });

  return {
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    messages: result.messages.map((message) => ({
      line: message.line,
      column: message.column,
      severity: message.severity,
      ruleId: message.ruleId,
      message: message.message
    }))
  };
}

const availableTools = {
    checkCodeQuality
  };
  
module.exports = {
  checkCodeQuality,
  availableTools
};