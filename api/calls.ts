// Exemple d'API pour récupérer un appel par ID
export const getCallById = async (id: string) => {
    // Implémentation pour récupérer un appel depuis votre backend ou un service externe
    // Voici un exemple fictif
    const response = await fetch(`/api/calls/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch call');
    }
    return await response.json();
  };
  