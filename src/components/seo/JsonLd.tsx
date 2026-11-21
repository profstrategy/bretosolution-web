export interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  const serialized = JSON.stringify(data);
  if (serialized === undefined) {
    throw new Error('JSON-LD data could not be serialized.');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized.replace(/</g, '\\u003c') }}
    />
  );
}
