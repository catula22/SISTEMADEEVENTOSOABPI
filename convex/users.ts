import { action } from "./_generated/server";
import { api } from "./_generated/api";

const sectors = [
  'COMISSÕES', 'ESA PIAUÍ', 'DCE', 'IMPRENSA', 'PODCAST', 
  'DEMANDAS EXTERNAS', 'PRESIDÊNCIA'
];

export const createSectorUsers = action({
  handler: async (ctx) => {
    for (const sector of sectors) {
      const email = sector.toLowerCase().replace(/ /g, "") + "@oab.pi";
      const password = `oab2025${sector.toLowerCase().replace(/ /g, "")}`;
      try {
        await ctx.runAction(api.auth.signIn, {
          provider: "password",
          params: {
            flow: "signUp",
            email,
            password,
          },
        });
        console.log(`Created user for ${sector} with email ${email}`);
      } catch (error: any) {
        console.error(`Failed to create user for ${sector}. It might already exist. Error: ${error.message}`);
      }
    }
    return "Finished creating sector users. Check the server logs for details.";
  },
});

export const createComissoesUser = action({
  handler: async (ctx) => {
    const email = "comissoes@oabpiaui.org.br";
    const password = "comissoes2025!";
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email,
          password,
        },
      });
      return `Successfully created user with email: ${email}`;
    } catch (error: any) {
      return `Failed to create user. It might already exist. Error: ${error.message}`;
    }
  },
});

export const createDceUser = action({
  handler: async (ctx) => {
    const email = "dce@oabpiaui.org.br";
    const password = "dce2025oabpi";
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email,
          password,
        },
      });
      return `Successfully created user with email: ${email}`;
    } catch (error: any) {
      return `Failed to create user. It might already exist. Error: ${error.message}`;
    }
  },
});

export const createImprensaUser = action({
  handler: async (ctx) => {
    const email = "imprensa@oabpiaui.org.br";
    const password = "2025imprensa";
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email,
          password,
        },
      });
      return `Successfully created user with email: ${email}`;
    } catch (error: any) {
      return `Failed to create user. It might already exist. Error: ${error.message}`;
    }
  },
});

export const createPodcastUser = action({
  handler: async (ctx) => {
    const email = "podcast@oabpiaui.org.br";
    const password = "podcastpi2025";
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email,
          password,
        },
      });
      return `Successfully created user with email: ${email}`;
    } catch (error: any) {
      return `Failed to create user. It might already exist. Error: ${error.message}`;
    }
  },
});

export const createDemandasExternasUser = action({
  handler: async (ctx) => {
    const email = "demandasexternas@oabpiaui.org.br";
    const password = "demandaspi2025";
    try {
      await ctx.runAction(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email,
          password,
        },
      });
      return `Successfully created user with email: ${email}`;
    } catch (error: any) {
      return `Failed to create user. It might already exist. Error: ${error.message}`;
    }
  },
});
