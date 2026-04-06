/** Role shell for layout only — values filled from Signal Engine APIs where available. */

function roleShell(label, uav) {
  return {
    label,
    urole: '—',
    uav,
    recLabel: '—',
    recTotal: '—',
    recDelta: '—',
    recDrivers: [],
    brief: [],
    chips: [],
    sigOrder: [],
  };
}

export const ROLES = {
  CEO: roleShell('CEO', 'CE'),
  CFO: roleShell('CFO', 'CF'),
  COO: roleShell('COO', 'CO'),
};
