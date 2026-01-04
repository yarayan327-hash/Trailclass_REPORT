/**
 * Server Actions 统一导出
 */

// Teacher Actions
export {
  getAvailableSessions,
  claimSession,
  createReport,
  getMaterials,
  submitAssessment,
} from "./teacher";

// Admin Actions
export {
  importClassSessions,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAllMaterials,
  getDailyOperations,
} from "./admin";

// Parent Actions
export {
  getReportByToken,
  validateReportToken,
} from "./parent";



