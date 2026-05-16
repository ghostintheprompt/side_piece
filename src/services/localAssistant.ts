export async function getAssistantResponse(prompt: string, context: string, token: string) {
  try {
    const response = await fetch('/api/assistant/respond', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      throw new Error(`Assistant request failed with ${response.status}`);
    }

    const data = await response.json();
    return data.text as string | undefined;
  } catch (error) {
    console.error('Assistant failure:', error);
    return "The line is fraying, Sugar. Let's wait for the air to clear before we try that again.";
  }
}
