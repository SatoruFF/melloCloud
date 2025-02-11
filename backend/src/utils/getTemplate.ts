import ejs from "ejs";
import { mailTemplate } from "../configs/mailTemplate.js";

export const getTemplate = (userData) => {
  const htmlEmail = ejs.render(mailTemplate, userData);

  return htmlEmail
};