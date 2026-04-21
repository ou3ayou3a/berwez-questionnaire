export const storage = {
  async get(key) {
    try {
      const res = await fetch(`/api/data/${key}`);
      const data = await res.json();
      if (data.value === null) return null;
      return { value: data.value };
    } catch (e) { return null; }
  },
  async set(key, value) {
    try {
      await fetch(`/api/data/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      return true;
    } catch (e) { return false; }
  },
  async delete(key) {
    try {
      await fetch(`/api/data/${key}`, { method: "DELETE" });
      return true;
    } catch (e) { return false; }
  },
};
