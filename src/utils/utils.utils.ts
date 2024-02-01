export const generateCode = (): string => {
  if (process.env.DEBUG !== "true") {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }
  
  return "123456";
};