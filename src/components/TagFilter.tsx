interface Props {
  allTags: string[];
  currentTag: string | null;
  basePath: string;
}

export default function TagFilter({ allTags, currentTag, basePath }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`${basePath}/`}
        className={`rounded-full px-3 py-1 text-sm no-underline transition-colors ${
          currentTag === null
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
        }`}
      >
        All
      </a>
      {allTags.map((tag) => (
        <a
          key={tag}
          href={`${basePath}/tags/${tag}/`}
          className={`rounded-full px-3 py-1 text-sm no-underline transition-colors ${
            currentTag === tag
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {tag}
        </a>
      ))}
    </div>
  );
}
