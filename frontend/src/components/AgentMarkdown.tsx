import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AgentMarkdownProps = {
  content: string;
};

export default function AgentMarkdown({ content }: AgentMarkdownProps) {
  return (
    <div className="agent-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
