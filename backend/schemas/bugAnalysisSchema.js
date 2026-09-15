const { z } = require("zod");

const bugAnalysisSchema = z.object({
  hasBugs: z.boolean(),
  summary: z.string(),
  bugs: z.array(
    z.object({
      line: z.number().nullable(),
      issue: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      suggestion: z.string()
    })
  ),
  improvedCode: z.string()
});

module.exports = {
  bugAnalysisSchema
};