import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const text = `
| Organization         | Role                | Duration               | Location        | Key Achievements                                                                                                                                                                 |
|----------------------|---------------------|------------------------|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Infiniti Research** | Software Engineer   | Oct 2025 – Present     | Bengaluru, India | • Architected an end-to-end Gen AI report pipeline automating 250+ page reports<br>• Built LangFlow orchestration layer for manager independence<br>• Engineered MCP server-client handling 10+ min inference timeouts |
`;

const tree = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .parse(text);

console.log(JSON.stringify(tree, null, 2));
