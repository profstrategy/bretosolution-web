export class TooManyAttemptsError extends Error {
  constructor() {
    super();
    this.name = 'TooManyAttemptsError';
  }
}

interface SuccessfulSubmission {
  ok: true;
  id: string;
}

function isSuccessfulSubmission(value: unknown): value is SuccessfulSubmission {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    value.ok === true &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

export async function submitRequest(
  endpoint: string,
  values: object
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      signal: controller.signal,
    });

    if (response.status === 429) throw new TooManyAttemptsError();
    if (!response.ok) throw new Error('Request submission failed.');

    const result: unknown = await response.json();
    if (!isSuccessfulSubmission(result)) {
      throw new Error('Request submission returned an invalid response.');
    }

    return result.id;
  } finally {
    clearTimeout(timeout);
  }
}
