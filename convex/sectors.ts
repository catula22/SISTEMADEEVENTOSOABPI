import { query } from "./_generated/server";

export const getSectors = query({
  args: {},
  handler: async () => {
    return [
      { 
        name: 'COMISSÕES', 
        color: 'bg-blue-500', 
        textColor: 'text-black',
        bgLight: 'bg-blue-50',
        unselected: 'bg-blue-100 !important text-black-800' 
      },
      { 
        name: 'ESA PIAUÍ', 
        color: 'bg-emerald-500', 
        textColor: 'text-black',
        bgLight: 'bg-emerald-50',
        unselected: 'bg-emerald-100 !important text-black-800'
      },
      { 
        name: 'DCE', 
        color: 'bg-amber-500', 
        textColor: 'text-black',
        bgLight: 'bg-amber-50',
        unselected: 'bg-amber-100 !important text-black-800' 
      },
      { 
        name: 'IMPRENSA', 
        color: 'bg-violet-500', 
        textColor: 'text-black',
        bgLight: 'bg-violet-50',
        unselected: 'bg-violet-100 !important text-black-800' 
      },
      { 
        name: 'PODCAST', 
        color: 'bg-red-500', 
        textColor: 'text-black',
        bgLight: 'bg-red-50',
        unselected: 'bg-red-100 !important text-black-800' 
      },
      { 
        name: 'DEMANDAS EXTERNAS', 
        color: 'bg-indigo-600', 
        textColor: 'text-black',
        bgLight: 'bg-indigo-50',
        unselected: 'bg-indigo-100 !important text-black-800' 
      },
      { 
        name: 'PRESIDÊNCIA', 
        color: 'bg-gray-800', 
        textColor: 'text-black',
        bgLight: 'bg-gray-100',
        unselected: 'bg-gray-200 !important text-black-900' 
      },
    ];
  },
});
