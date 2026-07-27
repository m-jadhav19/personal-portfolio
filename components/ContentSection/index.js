import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <div className="code-block-wrapper" style={{ maxWidth: '100%', overflow: 'hidden' }}>
        <SyntaxHighlighter
          style={dracula}
          language={match[1]}
          PreTag="div"
          customStyle={{
            maxWidth: '100%',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

const ContentSection = ({ content }) => {
  return (
    <ReactMarkdown components={CodeBlock} className="markdown-class">
      {content}
    </ReactMarkdown>
  );
};

export default ContentSection;
