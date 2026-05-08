const getApiBase = () => {
  return import.meta.env.VITE_API_BASE || "https://bitetrack-backend-yfkf.onrender.com";
};

export default getApiBase;
