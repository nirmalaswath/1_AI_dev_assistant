function getCodeLanguage(code) {
    if (
      code.includes("def ") ||
      code.includes("print(") ||
      code.includes("import ")
    ) {
      return "python";
    }
  
    if (
      code.includes("const ") ||
      code.includes("let ") ||
      code.includes("function ") ||
      code.includes("console.log")
    ) {
      return "javascript";
    }
  
    return "unknown";
  }
  
  const availableTools = {
    getCodeLanguage
  };
  
  module.exports = {
    getCodeLanguage,
    availableTools
  };