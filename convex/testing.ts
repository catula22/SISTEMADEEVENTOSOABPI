import { action } from "./_generated/server";
import { api } from "./_generated/api";

const usersToCreate = [
  // ESA PI
  { email: "caroline@esapi.com", password: "HpAnFVfg" },
  { email: "dhanys@esapi.com", password: "F923VHBj" },
  // DEPARTAMENTO DE CULTURA E EVENTOS
  { email: "manoel@dce.com", password: "67KKbITi" },
  { email: "joselia@dce.com", password: "RwGSvGIE" },
  { email: "dalila@dce.com", password: "kW3svcXF" },
  // IMPRENSA
  { email: "nataniel@imprensa.com", password: "wy91J3Dd" },
  { email: "luana@imprensa.com", password: "brfXRExR" },
  // COMISSÕES
  { email: "giordana@comissoes.com", password: "CC2jty5V" },
  // DEMANDAS EXTERNAS
  { email: "aurideia@demandasexternas.com", password: "10qOO14w" },
  // PRESIDENCIA
  { email: "iarema@presidencia.com", password: "dOGCA4Dj" },
  { email: "luzia@presidencia.com", password: "YrGAKYS2" },
];

export const createCustomUsers = action({
  handler: async (ctx) => {
    for (const user of usersToCreate) {
      try {
        await ctx.runAction(api.auth.signIn, {
          provider: "password",
          params: {
            flow: "signUp",
            email: user.email,
            password: user.password,
          },
        });
        console.log(`Created user with email ${user.email}`);
      } catch (error: any) {
        console.error(
          `Failed to create user with email ${user.email}. It might already exist. Error: ${error.message}`
        );
      }
    }
    return "Finished creating custom users. Check the server logs for details.";
  },
});
