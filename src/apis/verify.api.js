export const verifyDocumentAPI = async (fileLink) => {
  const BACKEN_URL = "http://localhost:8000";
  const response = await fetch(
    `${BACKEN_URL}/verify-document?file_link=${fileLink}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  return data;
};
