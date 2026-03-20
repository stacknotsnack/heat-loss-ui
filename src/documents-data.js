/**
 * Documents Data
 * All document data for the Information & Documents page.
 * generatorId must match a key in pdf-generator.js GENERATORS map.
 */

export const SECTION1_DOCUMENTS = [
  { id: 's1-1',  name: 'Heat Pump Survey',                  generatorId: 'hp-survey',           description: 'Initial site survey and assessment for heat pump installation',      icon: 'survey'    },
  { id: 's1-2',  name: 'MCS Handover Checklist',            generatorId: 'mcs-handover',         description: 'MCS required handover documentation for customer',                   icon: 'checklist' },
  { id: 's1-3',  name: 'Letter of Consent',                 generatorId: 'letter-consent',       description: 'Customer consent letter for installation works',                     icon: 'letter'    },
  { id: 's1-4',  name: 'Installation Record',               generatorId: 'installation-record',  description: 'Full record of the installation works completed',                    icon: 'record'    },
  { id: 's1-5',  name: 'BS 7671',                           generatorId: 'bs7671',               description: 'Electrical installation certificate to BS 7671 wiring regulations',  icon: 'electric'  },
  { id: 's1-6',  name: 'Cooling Off Waiver',                generatorId: 'cooling-waiver',       description: 'Customer waiver of 14-day cooling off period',                      icon: 'waiver'    },
  { id: 's1-7',  name: 'MCS 031 Performance Calculation',   generatorId: 'mcs-031',              description: 'MCS 031 heat loss and system performance calculation',               icon: 'calc'      },
  { id: 's1-8',  name: 'MCS Compliance Certificate',        generatorId: 'mcs-cert',             description: 'Certificate of MCS compliance for the installation',                icon: 'cert'      },
  { id: 's1-9',  name: 'Customer Proposal',                 generatorId: 'proposal',             description: 'Signed customer proposal and system specification',                 icon: 'proposal'  },
  { id: 's1-10', name: 'Technical Report',                  generatorId: 'tech-report',          description: 'Full technical report for the installation',                        icon: 'report'    },
  { id: 's1-11', name: 'Heat Pump Handover Document',       generatorId: 'handover',             description: 'System handover document explaining operation to the customer',     icon: 'handover'  },
  { id: 's1-12', name: 'Heat Pump Commissioning Checklist', generatorId: 'commissioning',        description: 'Full commissioning checklist completed on site',                    icon: 'checklist' },
  { id: 's1-13', name: 'Heat Pump Service Record',          generatorId: 'service-record',       description: 'Ongoing service and maintenance record',                            icon: 'service'   },
  { id: 's1-14', name: 'ENA Connect Direct',                generatorId: 'ena-connect',          description: 'ENA G99/G98 connection application for DNO approval',               icon: 'network'   },
];

export const SECTION2_DOCUMENTS = [
  { id: 's2-1',  name: 'DNO Commissioning Form',            generatorId: 'dno-form',             description: 'Required DNO commissioning notification and approval form',         icon: 'dno',      featured: true },
  { id: 's2-2',  name: 'Heat Pump Survey',                  generatorId: 'hp-survey',            description: 'Initial site survey and assessment for heat pump installation',    icon: 'survey'    },
  { id: 's2-3',  name: 'MCS Handover Checklist',            generatorId: 'mcs-handover',         description: 'MCS required handover documentation for customer',                 icon: 'checklist' },
  { id: 's2-4',  name: 'Letter of Consent',                 generatorId: 'letter-consent',       description: 'Customer consent letter for installation works',                   icon: 'letter'    },
  { id: 's2-5',  name: 'Installation Record',               generatorId: 'installation-record',  description: 'Full record of the installation works completed',                  icon: 'record'    },
  { id: 's2-6',  name: 'BS 7671',                           generatorId: 'bs7671',               description: 'Electrical installation certificate to BS 7671',                   icon: 'electric'  },
  { id: 's2-7',  name: 'Cooling Off Waiver',                generatorId: 'cooling-waiver',       description: 'Customer waiver of 14-day cooling off period',                    icon: 'waiver'    },
  { id: 's2-8',  name: 'MCS 031 Performance Calculation',   generatorId: 'mcs-031',              description: 'MCS 031 heat loss and system performance calculation',             icon: 'calc'      },
  { id: 's2-9',  name: 'MCS Compliance Certificate',        generatorId: 'mcs-cert',             description: 'Certificate of MCS compliance for the installation',              icon: 'cert'      },
  { id: 's2-10', name: 'Customer Proposal',                 generatorId: 'proposal',             description: 'Signed customer proposal and system specification',               icon: 'proposal'  },
  { id: 's2-11', name: 'Technical Report',                  generatorId: 'tech-report',          description: 'Full technical report for the installation',                      icon: 'report'    },
  { id: 's2-12', name: 'Heat Pump Handover Document',       generatorId: 'handover',             description: 'System handover document explaining operation to the customer',   icon: 'handover'  },
  { id: 's2-13', name: 'Heat Pump Commissioning Checklist', generatorId: 'commissioning',        description: 'Full commissioning checklist completed on site',                  icon: 'checklist' },
];

export const SECTION3_COMPLETE = [
  { id: 's3-c1', name: 'Heat Pump Commissioning Checklist', generatorId: 'commissioning', description: 'Commissioning checklist completed and signed off', icon: 'checklist', status: 'complete', completedDate: '12 Mar 2026' },
];

export const SECTION3_INCOMPLETE = [
  { id: 's3-i1', name: 'DNO Commissioning Form',             generatorId: 'dno-form',             description: 'Required DNO commissioning notification form',         icon: 'dno'      },
  { id: 's3-i2', name: 'Compliance Certificate',             generatorId: 'mcs-cert',             description: 'MCS compliance certificate pending issue',             icon: 'cert'     },
  { id: 's3-i3', name: 'MCS Handover Checklist',             generatorId: 'mcs-handover',         description: 'MCS required handover documentation for customer',     icon: 'checklist' },
  { id: 's3-i4', name: 'Letter of Consent',                  generatorId: 'letter-consent',       description: 'Customer consent letter for installation works',       icon: 'letter'   },
  { id: 's3-i5', name: 'BS 7671',                            generatorId: 'bs7671',               description: 'Electrical installation certificate to BS 7671',       icon: 'electric' },
  { id: 's3-i6', name: 'Customer Proposal',                  generatorId: 'proposal',             description: 'Signed customer proposal and system specification',   icon: 'proposal' },
  { id: 's3-i7', name: 'Heat Pump Handover Document',        generatorId: 'handover',             description: 'System handover document for customer',               icon: 'handover' },
  { id: 's3-i8', name: 'Heat Pump Service Record',           generatorId: 'service-record',       description: 'Ongoing service and maintenance record',              icon: 'service'  },
  { id: 's3-i9', name: 'DNO Application via Connect Direct', generatorId: 'ena-connect',          description: 'ENA G99/G98 connection application submitted to DNO', icon: 'network'  },
];

export const ICON_MAP = {
  survey: '📋', checklist: '✅', letter: '✉️', record: '📝',
  electric: '⚡', waiver: '🖊️', calc: '🔢', cert: '🏅',
  proposal: '📄', report: '📊', handover: '🤝', service: '🔧',
  network: '🌐', dno: '🔌', default: '📄',
};

export function getIcon(type) {
  return ICON_MAP[type] || ICON_MAP.default;
}
