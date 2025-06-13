import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
// @ts-ignore
import { Database, Resource } from "@adminjs/prisma";
import type { Express } from "express";
// import { prisma } from "../configs/config";

// 👇 Регистрируем адаптер
AdminJS.registerAdapter({ Database, Resource });

const runAdmin = async (app: Express) => {
  const adminJs = new AdminJS({
    rootPath: "/admin",
    // FIXME: Uncomment and configure resources if you have any
    // resources: [
    //   { resource: prisma.user },
    // ],
    branding: {
      companyName: "My Admin",
      logo: false,
    },
  });

  const adminRouter = AdminJSExpress.buildRouter(adminJs);
  app.use(adminJs.options.rootPath, adminRouter);
};

export default runAdmin;
