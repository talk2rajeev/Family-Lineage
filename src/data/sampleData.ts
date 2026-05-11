import { FamilyTree } from '@/types/family';

export const sampleTrees: Record<string, FamilyTree> = {
  sharma: {
    id: 'sharma',
    name: "Sharma Family Tree",
    ownerId: "rajeev",
    isPublic: true,
    nodes: [
      // === GENERATION 0 ===
      { id: 'shiv_baksha', name: 'Shiv Baksha Sharma', gender: 'M', role: 'Ancestor', position: { x: 1000, y: 50 } },

      // === GENERATION 1 ===
      { id: 'kauleshwar', name: 'Kauleshwar Sharma', gender: 'M', role: 'Patriarch', position: { x: 1000, y: 200 } },

      // === GENERATION 2 ===
      { id: 'rambriksha', name: 'Rambriksha Sharma', gender: 'M', deathYear: 2000, position: { x: 300, y: 350 } },
      { id: 'ramb_spouse', name: 'XXX Sharma', gender: 'F', isSpouse: true, spouseOf: 'rambriksha', position: { x: 180, y: 350 } },
      
      { id: 'mishri_lal', name: 'Mishri Lal Sharma', gender: 'M', deathYear: 2000, position: { x: 1000, y: 350 } },
      { id: 'mishri_spouse', name: 'Chandravati Sharma', gender: 'F', isSpouse: true, spouseOf: 'mishri_lal', position: { x: 880, y: 350 } },
      
      { id: 'rajendra', name: 'Rajendra Sharma', gender: 'M', position: { x: 1800, y: 350 } },
      { id: 'rajendra_spouse', name: 'Gayatri Sharma', gender: 'F', isSpouse: true, spouseOf: 'rajendra', position: { x: 1680, y: 350 } },
      
      { id: 'xxx_daughter_k', name: 'XXX Sharma', gender: 'F', position: { x: 2100, y: 350 } },

      // === GENERATION 3: RAMBRIKSHA BRANCH ===
      { id: 'devi', name: 'Devi Sharma', gender: 'F', deathYear: 2010, position: { x: 150, y: 500 } },
      { id: 'shankar_d', name: 'Shankar Sharma', gender: 'M', isSpouse: true, spouseOf: 'devi', position: { x: 270, y: 500 } },
      { id: 'maya', name: 'Maya Sharma', gender: 'F', position: { x: 450, y: 500 } },
      { id: 'manoj_maya', name: 'Manoj Sharma', gender: 'M', isSpouse: true, spouseOf: 'maya', position: { x: 570, y: 500 } },
      { id: 'kamla', name: 'Kamla Sharma', gender: 'F', deathYear: 2015, position: { x: 700, y: 500 } },

      // === GENERATION 4: DEVI'S CHILDREN ===
      { id: 'santosh', name: 'Santosh Sharma', gender: 'M', position: { x: 50, y: 650 } },
      { id: 'kushum', name: 'Kushum Sharma', gender: 'F', isSpouse: true, spouseOf: 'santosh', position: { x: -70, y: 650 } },
      { id: 'triloki', name: 'Triloki Sharma', gender: 'M', position: { x: 250, y: 650 } },
      { id: 'sanju_t', name: 'Sanju Sharma', gender: 'F', isSpouse: true, spouseOf: 'triloki', position: { x: 370, y: 650 } },

      // === GENERATION 4: MAYA'S CHILDREN ===
      { id: 'manjeet', name: 'Manjeet Sharma', gender: 'M', position: { x: 450, y: 650 } },
      { id: 'mandeep', name: 'Mandeep Sharma', gender: 'M', position: { x: 550, y: 650 } },
      { id: 'maneesh', name: 'Maneesh Sharma', gender: 'M', position: { x: 650, y: 650 } },

      // === GENERATION 5: SANTOSH'S CHILDREN ===
      { id: 'xxx_m_santosh', name: 'XXX Sharma', gender: 'M', position: { x: -10, y: 800 } },
      { id: 'shristi_s', name: 'Shristi Sharma', gender: 'F', position: { x: 110, y: 800 } },

      // === GENERATION 5: TRILOKI'S CHILDREN ===
      { id: 'advait', name: 'Advait Sharma', gender: 'M', position: { x: 250, y: 800 } },

      // === GENERATION 3: MISHRI LAL BRANCH ===
      { id: 'reena', name: 'Reena Sharma', gender: 'F', position: { x: 850, y: 500 } },
      { id: 'arun', name: 'Arun Sharma', gender: 'M', isSpouse: true, spouseOf: 'reena', position: { x: 730, y: 500 } },
      { id: 'asha', name: 'Asha Sharma', gender: 'F', position: { x: 1100, y: 500 } },
      { id: 'manoj_asha', name: 'Manoj Sharma', gender: 'M', isSpouse: true, spouseOf: 'asha', position: { x: 1220, y: 500 } },
      { id: 'ravi', name: 'Ravi Sharma', gender: 'M', position: { x: 1350, y: 500 } },
      { id: 'jyoti', name: 'Jyoti Sharma', gender: 'F', isSpouse: true, spouseOf: 'ravi', position: { x: 1470, y: 500 } },
      { id: 'rajeev', name: 'Rajeev R Sharma', gender: 'M', position: { x: 1600, y: 500 } },
      { id: 'priya_r', name: 'Priya Sharma', gender: 'F', isSpouse: true, spouseOf: 'rajeev', position: { x: 1720, y: 500 } },

      // === GENERATION 4: REENA'S CHILDREN ===
      { id: 'aparma', name: 'Aparma Sharma', gender: 'F', position: { x: 750, y: 650 } },
      { id: 'sneha', name: 'Sneha Sharma', gender: 'F', position: { x: 830, y: 650 } },
      { id: 'vaisnavi', name: 'Vaisnavi Sharma', gender: 'F', position: { x: 910, y: 650 } },
      { id: 'shivansh', name: 'Shivansh Sharma', gender: 'M', position: { x: 990, y: 650 } },

      // === GENERATION 4: ASHA'S CHILDREN ===
      { id: 'prince', name: 'Prince Sharma', gender: 'M', position: { x: 1080, y: 650 } },
      { id: 'shruti', name: 'Shruti Sharma', gender: 'F', position: { x: 1160, y: 650 } },
      { id: 'surabhi', name: 'Surabhi Sharma', gender: 'F', position: { x: 1240, y: 650 } },

      // === GENERATION 4: RAVI'S CHILDREN ===
      { id: 'rishika', name: 'Rishika Sharma', gender: 'F', position: { x: 1350, y: 650 } },
      { id: 'reyansh', name: 'Reyansh Sharma', gender: 'M', position: { x: 1430, y: 650 } },

      // === GENERATION 4: RAJEEV'S CHILDREN ===
      { id: 'raghav', name: 'Raghav Sharma', gender: 'M', position: { x: 1600, y: 650 } },

      // === GENERATION 3: RAJENDRA BRANCH ===
      { id: 'brijesh', name: 'Brijesh Sharma', gender: 'M', position: { x: 1900, y: 500 } },
      { id: 'kiran', name: 'Kiran Sharma', gender: 'F', isSpouse: true, spouseOf: 'brijesh', position: { x: 2020, y: 500 } },
      { id: 'manju', name: 'Manju Sharma', gender: 'F', position: { x: 2150, y: 500 } },
      { id: 'ramesh', name: 'Ramesh Sharma', gender: 'M', isSpouse: true, spouseOf: 'manju', position: { x: 2270, y: 500 } },
      { id: 'sanju_s', name: 'Sanju Sharma', gender: 'F', position: { x: 2400, y: 500 } },
      { id: 'manoj_sanju', name: 'Manoj Sharma', gender: 'M', isSpouse: true, spouseOf: 'sanju_s', position: { x: 2520, y: 500 } },

      // === GENERATION 4: BRIJESH'S CHILDREN ===
      { id: 'aman', name: 'Aman Sharma', gender: 'M', position: { x: 1850, y: 650 } },
      { id: 'shristi_a', name: 'Shristi Sharma', gender: 'F', isSpouse: true, spouseOf: 'aman', position: { x: 1970, y: 650 } },
      { id: 'nisha', name: 'Nisha Sharma', gender: 'F', position: { x: 2050, y: 650 } },
      { id: 'ansh', name: 'Ansh Sharma', gender: 'M', position: { x: 2130, y: 650 } },

      // === GENERATION 4: MANJU'S CHILDREN ===
      { id: 'lalla', name: 'Lalla Sharma', gender: 'M', position: { x: 2200, y: 650 } },
      { id: 'lali', name: 'Lali Sharma', gender: 'F', position: { x: 2300, y: 650 } },

      // === GENERATION 4: SANJU'S CHILDREN ===
      { id: 'xxx_m_sanju', name: 'XXX Sharma', gender: 'M', position: { x: 2450, y: 650 } },
      { id: 'xxx_f_sanju', name: 'XXX Sharma', gender: 'F', position: { x: 2550, y: 650 } },
    ],
    edges: [
      // Kauleshwar Line
      { id: 'e_shiv_kau', source: 'shiv_baksha', target: 'kauleshwar', type: 'parent-child' },
      { id: 'e_kau_ram', source: 'kauleshwar', target: 'rambriksha', type: 'parent-child' },
      { id: 'e_kau_mis', source: 'kauleshwar', target: 'mishri_lal', type: 'parent-child' },
      { id: 'e_kau_raj', source: 'kauleshwar', target: 'rajendra', type: 'parent-child' },
      { id: 'e_kau_xxx', source: 'kauleshwar', target: 'xxx_daughter_k', type: 'parent-child' },

      // Spouses Gen 2
      { id: 's_ram', source: 'rambriksha', target: 'ramb_spouse', type: 'spouse' },
      { id: 's_mis', source: 'mishri_lal', target: 'mishri_spouse', type: 'spouse' },
      { id: 's_raj', source: 'rajendra', target: 'rajendra_spouse', type: 'spouse' },

      // Rambriksha Branch
      { id: 'e_ram_dev', source: 'rambriksha', target: 'devi', type: 'parent-child' },
      { id: 'e_ram_may', source: 'rambriksha', target: 'maya', type: 'parent-child' },
      { id: 'e_ram_kam', source: 'rambriksha', target: 'kamla', type: 'parent-child' },
      { id: 's_dev', source: 'devi', target: 'shankar_d', type: 'spouse' },
      { id: 's_may', source: 'maya', target: 'manoj_maya', type: 'spouse' },

      // Devi Branch
      { id: 'e_dev_san', source: 'devi', target: 'santosh', type: 'parent-child' },
      { id: 'e_dev_tri', source: 'devi', target: 'triloki', type: 'parent-child' },
      { id: 's_san', source: 'santosh', target: 'kushum', type: 'spouse' },
      { id: 's_tri', source: 'triloki', target: 'sanju_t', type: 'spouse' },
      { id: 'e_san_xxx', source: 'santosh', target: 'xxx_m_santosh', type: 'parent-child' },
      { id: 'e_san_shr', source: 'santosh', target: 'shristi_s', type: 'parent-child' },
      { id: 'e_tri_adv', source: 'triloki', target: 'advait', type: 'parent-child' },

      // Maya Branch
      { id: 'e_may_m1', source: 'maya', target: 'manjeet', type: 'parent-child' },
      { id: 'e_may_m2', source: 'maya', target: 'mandeep', type: 'parent-child' },
      { id: 'e_may_m3', source: 'maya', target: 'maneesh', type: 'parent-child' },

      // Mishri Lal Branch
      { id: 'e_mis_ree', source: 'mishri_lal', target: 'reena', type: 'parent-child' },
      { id: 'e_mis_ash', source: 'mishri_lal', target: 'asha', type: 'parent-child' },
      { id: 'e_mis_rav', source: 'mishri_lal', target: 'ravi', type: 'parent-child' },
      { id: 'e_mis_raj', source: 'mishri_lal', target: 'rajeev', type: 'parent-child' },

      // Reena Branch
      { id: 's_ree', source: 'reena', target: 'arun', type: 'spouse' },
      { id: 'e_ree_c1', source: 'reena', target: 'aparma', type: 'parent-child' },
      { id: 'e_ree_c2', source: 'reena', target: 'sneha', type: 'parent-child' },
      { id: 'e_ree_c3', source: 'reena', target: 'vaisnavi', type: 'parent-child' },
      { id: 'e_ree_c4', source: 'reena', target: 'shivansh', type: 'parent-child' },

      // Asha Branch
      { id: 's_ash', source: 'asha', target: 'manoj_asha', type: 'spouse' },
      { id: 'e_ash_c1', source: 'asha', target: 'prince', type: 'parent-child' },
      { id: 'e_ash_c2', source: 'asha', target: 'shruti', type: 'parent-child' },
      { id: 'e_ash_c3', source: 'asha', target: 'surabhi', type: 'parent-child' },

      // Ravi Branch
      { id: 's_rav', source: 'ravi', target: 'jyoti', type: 'spouse' },
      { id: 'e_rav_c1', source: 'ravi', target: 'rishika', type: 'parent-child' },
      { id: 'e_rav_c2', source: 'ravi', target: 'reyansh', type: 'parent-child' },

      // Rajeev Branch
      { id: 's_raj_p', source: 'rajeev', target: 'priya_r', type: 'spouse' },
      { id: 'e_raj_c1', source: 'rajeev', target: 'raghav', type: 'parent-child' },

      // Rajendra Branch
      { id: 'e_raj_bri', source: 'rajendra', target: 'brijesh', type: 'parent-child' },
      { id: 'e_raj_man', source: 'rajendra', target: 'manju', type: 'parent-child' },
      { id: 'e_raj_sanj', source: 'rajendra', target: 'sanju_s', type: 'parent-child' },

      // Brijesh Branch
      { id: 's_bri', source: 'brijesh', target: 'kiran', type: 'spouse' },
      { id: 'e_bri_c1', source: 'brijesh', target: 'aman', type: 'parent-child' },
      { id: 'e_bri_c2', source: 'brijesh', target: 'nisha', type: 'parent-child' },
      { id: 'e_bri_c3', source: 'brijesh', target: 'ansh', type: 'parent-child' },
      { id: 's_aman', source: 'aman', target: 'shristi_a', type: 'spouse' },

      // Manju Branch
      { id: 's_man', source: 'manju', target: 'ramesh', type: 'spouse' },
      { id: 'e_man_c1', source: 'manju', target: 'lalla', type: 'parent-child' },
      { id: 'e_man_c2', source: 'manju', target: 'lali', type: 'parent-child' },

      // Sanju Branch
      { id: 's_sanj_s', source: 'sanju_s', target: 'manoj_sanju', type: 'spouse' },
      { id: 'e_sanj_c1', source: 'sanju_s', target: 'xxx_m_sanju', type: 'parent-child' },
      { id: 'e_sanj_c2', source: 'sanju_s', target: 'xxx_f_sanju', type: 'parent-child' },
    ],
  },
};